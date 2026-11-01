import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import Subscription from '@/models/Subscription'
import SubscriptionTransaction from '@/models/SubscriptionTransaction'
import SubscriptionRefund from '@/models/SubscriptionRefund'
import PaymentSettings from '@/models/PaymentSettings'
import { createExpressCharge } from '@/lib/express-gateway'
import { expressReadiness } from '@/lib/express-gateway'
import { notifyUsers } from '@/lib/notify-users'
import { recordAudit } from '@/lib/record-audit'
import {
  BILLING_INTERVALS,
  DEFAULT_GRACE_DAYS,
  DEFAULT_PLAN_PRICE_AOA,
  DEFAULT_REMINDER_DAYS,
  SubscriptionError,
  advanceSubscription,
  formatIban,
  isBillingInterval,
  nextBillingPeriod,
  noticeCopy,
  proofDeadline,
  reactivation,
  refundableAmount,
  subscriptionAccess,
  type BillingInterval,
  type PaymentMethod,
  type PlanPrices,
} from '@/lib/subscriptions'

const OPEN_STATUSES = ['pending', 'awaiting_proof', 'under_review']
const DEFAULT_FEATURES = [
  'Publicar anúncios de suínos',
  'Pedir destaque dos anúncios aprovados',
  'Aceder aos conteúdos de membros',
  'Receber aviso antes da renovação',
]

function offerPrices(month: number) {
  return {
    week: Math.max(1, Math.round(month / 3)),
    month,
    semester: month * 5,
    year: month * 10,
  }
}

function readPrices(plan: { prices?: Record<string, unknown> | null; priceAoa?: number }): PlanPrices {
  const stored = plan.prices || {}
  const prices = { week: null, month: null, semester: null, year: null } as PlanPrices
  for (const interval of BILLING_INTERVALS) {
    const amount = Number(stored[interval])
    prices[interval] = Number.isInteger(amount) && amount > 0 ? amount : null
  }
  if (!prices.month && Number(plan.priceAoa) > 0) prices.month = Number(plan.priceAoa)
  return prices
}

function slugify(text: string) {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'plano'
}

function localRef() {
  return `man-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function asDate(value: unknown) {
  if (!value) return null
  const date = new Date(value as string)
  return Number.isFinite(date.getTime()) ? date : null
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name)
  let slug = base
  let suffix = 2
  while (await SubscriptionPlan.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

function isDuplicateKey(error: unknown) {
  return Boolean(error && typeof error === 'object' && (error as { code?: number }).code === 11000)
}

export async function ensureSubscriptionCatalog() {
  await connectDB()
  if (await SubscriptionPlan.countDocuments() === 0) {
    try {
      await SubscriptionPlan.create({
        name: 'Plano Pro',
        slug: 'plano-pro',
        description: 'Subscrição com acesso ao Plano Pro.',
        priceAoa: DEFAULT_PLAN_PRICE_AOA,
        prices: offerPrices(DEFAULT_PLAN_PRICE_AOA),
        features: DEFAULT_FEATURES,
        recommended: true,
        currency: 'AOA',
        active: true,
        graceDays: DEFAULT_GRACE_DAYS,
        reminderDays: DEFAULT_REMINDER_DAYS,
      })
    } catch (error) {
      if (!isDuplicateKey(error)) throw error
    }
  }
  const plans = await SubscriptionPlan.find()
  for (const plan of plans) {
    let changed = false
    if (!plan.prices?.month) {
      const month = plan.priceAoa || DEFAULT_PLAN_PRICE_AOA
      plan.prices = offerPrices(month)
      plan.priceAoa = month
      if (!plan.features?.length) plan.features = DEFAULT_FEATURES
      if (plan.slug === 'plano-pro') plan.recommended = true
      changed = true
    }
    if (!plan.description || plan.description === 'Subscrição mensal com acesso ao Plano Pro.') {
      plan.description = 'Subscrição com acesso ao Plano Pro.'
      changed = true
    }
    if (changed) await plan.save()
  }
  if (!await PaymentSettings.exists({ key: 'default' })) {
    try {
      await PaymentSettings.create({ key: 'default', expressEnabled: true, banks: [], paypay: [] })
    } catch (error) {
      if (!isDuplicateKey(error)) throw error
    }
  }
}

async function applyAccess(userId: string, allowed: boolean, until: Date | null) {
  const user = await User.findById(userId)
  if (!user) return
  if (allowed && until) {
    user.plan = 'pro'
    user.planExpiresAt = until
    await user.save()
    return
  }
  const current = user.planExpiresAt ? new Date(user.planExpiresAt).getTime() : 0
  const boundary = until ? until.getTime() : Date.now()
  if (user.plan === 'pro' && current && current <= Math.max(boundary, Date.now())) {
    user.plan = 'free'
    user.planExpiresAt = null
    await user.save()
  }
}

export async function runSubscriptionLifecycle() {
  await ensureSubscriptionCatalog()
  const now = new Date()
  const plans = await SubscriptionPlan.find().select('reminderDays').lean()
  const reminders = new Map(plans.map((plan) => [String(plan._id), plan.reminderDays as number[]]))
  const subs = await Subscription.find({ status: { $in: ['active', 'past_due'] } })

  for (const sub of subs) {
    const next = advanceSubscription({
      status: sub.status,
      renewsAt: sub.renewsAt,
      graceUntil: sub.graceUntil,
      notices: sub.notices,
    }, now, reminders.get(String(sub.plan)) || DEFAULT_REMINDER_DAYS)

    if (next.status !== sub.status) {
      const saved = await Subscription.updateOne({ _id: sub._id, status: sub.status }, { $set: { status: next.status } })
      if (saved.modifiedCount) {
        const access = subscriptionAccess({ status: next.status, renewsAt: sub.renewsAt, graceUntil: sub.graceUntil }, now)
        await applyAccess(String(sub.user), access.allowed, access.until)
      }
    }

    if (!next.notice) continue
    const marked = await Subscription.updateOne(
      { _id: sub._id, notices: { $ne: next.notice.key } },
      { $addToSet: { notices: next.notice.key } },
    )
    if (!marked.modifiedCount) continue
    const copy = noticeCopy(next.notice, asDate(sub.renewsAt), asDate(sub.graceUntil))
    await notifyUsers([String(sub.user)], { ...copy, href: '/painel#plano' })
  }

  await SubscriptionTransaction.updateMany(
    { status: { $in: OPEN_STATUSES }, expiresAt: { $ne: null, $lte: now } },
    { $set: { status: 'expired' } },
  )
}

function presentPlan(plan: Record<string, any>) {
  const prices = readPrices(plan)
  return {
    id: String(plan._id),
    name: plan.name,
    description: plan.description || '',
    priceAoa: prices.month || plan.priceAoa,
    prices,
    features: Array.isArray(plan.features) ? plan.features : [],
    recommended: Boolean(plan.recommended),
    currency: 'AOA',
    active: Boolean(plan.active),
    graceDays: plan.graceDays,
    reminderDays: plan.reminderDays || [],
  }
}

function presentSubscription(sub: Record<string, any> | null) {
  if (!sub) return null
  return {
    id: String(sub._id),
    status: sub.status,
    planName: sub.planName || '',
    priceAoa: sub.priceAoa || 0,
    billingInterval: isBillingInterval(sub.billingInterval || '') ? sub.billingInterval : 'month',
    startedAt: sub.startedAt || null,
    renewsAt: sub.renewsAt || null,
    graceUntil: sub.graceUntil || null,
    suspendedAt: sub.suspendedAt || null,
    paymentMethod: sub.paymentMethod || '',
  }
}

function presentTransaction(tx: Record<string, any>, user?: { name?: string; email?: string } | null) {
  return {
    id: String(tx._id),
    amount: tx.amount,
    currency: tx.currency || 'AOA',
    billingInterval: isBillingInterval(tx.billingInterval || '') ? tx.billingInterval : 'month',
    method: tx.method,
    status: tx.status,
    planName: tx.planName || '',
    instructions: tx.instructions || '',
    checkoutUrl: tx.checkoutUrl || '',
    channelLabel: tx.channelLabel || '',
    proofFileId: tx.proofFileId || '',
    proofNote: tx.proofNote || '',
    periodStart: tx.periodStart || null,
    periodEnd: tx.periodEnd || null,
    paidAt: tx.paidAt || null,
    createdAt: tx.createdAt,
    expiresAt: tx.expiresAt || null,
    reviewNote: tx.reviewNote || '',
    refundedAmount: tx.refundedAmount || 0,
    refundable: refundableAmount(tx.amount || 0, tx.refundedAmount || 0),
    userName: user?.name || '',
    userEmail: user?.email || '',
  }
}

function presentSettings(settings: Record<string, any>) {
  const readiness = expressReadiness()
  return {
    expressEnabled: Boolean(settings.expressEnabled),
    express: {
      state: readiness.state,
      missing: readiness.missing,
      ready: false,
    },
    banks: (settings.banks || []).map((bank: Record<string, any>) => ({
      id: String(bank._id),
      name: bank.name,
      holder: bank.holder,
      iban: bank.iban,
      active: Boolean(bank.active),
    })),
    paypay: (settings.paypay || []).map((account: Record<string, any>) => ({
      id: String(account._id),
      label: account.label,
      account: account.account,
      active: Boolean(account.active),
    })),
  }
}

async function settingsDoc() {
  await ensureSubscriptionCatalog()
  const settings = await PaymentSettings.findOne({ key: 'default' })
  if (!settings) throw new SubscriptionError('As definições de pagamento não estão disponíveis.', 500)
  return settings
}

export async function loadMemberBilling(userId: string) {
  await runSubscriptionLifecycle()
  const [subscription, plans, settings, transactions, refunds] = await Promise.all([
    Subscription.findOne({ user: userId }).lean(),
    SubscriptionPlan.find({ active: true }).sort({ priceAoa: 1 }).lean(),
    settingsDoc(),
    SubscriptionTransaction.find({ user: userId }).sort({ createdAt: -1 }).limit(30).lean(),
    SubscriptionRefund.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
  ])
  const channels = presentSettings(settings)
  return {
    subscription: presentSubscription(subscription as Record<string, any> | null),
    plans: plans.map((plan) => presentPlan(plan as Record<string, unknown>)),
    channels: {
      express: { enabled: channels.expressEnabled, ready: false, state: channels.express.state },
      banks: channels.banks.filter((bank: { active: boolean }) => bank.active),
      paypay: channels.paypay.filter((account: { active: boolean }) => account.active),
    },
    transactions: transactions.map((tx) => presentTransaction(tx as Record<string, any>)),
    refunds: refunds.map((refund) => ({
      id: String(refund._id),
      amount: refund.amount,
      reason: refund.reason,
      createdAt: refund.createdAt,
      transactionId: String(refund.transaction),
    })),
  }
}

export async function loadAdminBilling() {
  await runSubscriptionLifecycle()
  const [plans, subscriptions, transactions, refunds, settings] = await Promise.all([
    SubscriptionPlan.find().sort({ createdAt: 1 }).lean(),
    Subscription.find().sort({ updatedAt: -1 }).limit(100).populate('user', 'name email').lean(),
    SubscriptionTransaction.find().sort({ createdAt: -1 }).limit(80).populate('user', 'name email').lean(),
    SubscriptionRefund.find().sort({ createdAt: -1 }).limit(40).populate('user', 'name email').lean(),
    settingsDoc(),
  ])
  return {
    plans: plans.map((plan) => presentPlan(plan as Record<string, unknown>)),
    subscriptions: (subscriptions as Array<Record<string, any>>).map((sub) => ({
      ...presentSubscription(sub),
      userName: sub.user?.name || '',
      userEmail: sub.user?.email || '',
    })),
    transactions: (transactions as Array<Record<string, any>>).map((tx) => presentTransaction(tx, tx.user)),
    refunds: (refunds as Array<Record<string, any>>).map((refund) => ({
      id: String(refund._id),
      amount: refund.amount,
      reason: refund.reason,
      createdAt: refund.createdAt,
      transactionId: String(refund.transaction),
      userName: refund.user?.name || '',
      userEmail: refund.user?.email || '',
    })),
    settings: presentSettings(settings),
  }
}

async function openTransaction(userId: string) {
  return SubscriptionTransaction.findOne({
    user: userId,
    status: { $in: OPEN_STATUSES },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  })
}

export async function startCheckout(userId: string, input: { planId: string; method: PaymentMethod; channelId?: string; interval?: string }) {
  await runSubscriptionLifecycle()
  const plan = await SubscriptionPlan.findOne({ _id: input.planId, active: true })
  if (!plan) throw new SubscriptionError('Plano não encontrado.', 404)
  const interval: BillingInterval = isBillingInterval(input.interval || '') ? input.interval as BillingInterval : 'month'
  const amount = readPrices(plan)[interval]
  if (!amount) throw new SubscriptionError('Este plano não está disponível nesse período.', 400)

  const existing = await openTransaction(userId)
  if (existing) {
    return { transaction: presentTransaction(existing.toObject()), reused: true }
  }

  const settings = await settingsDoc()
  let providerRef = localRef()
  let checkoutUrl = ''
  let instructions = ''
  let channelId = ''
  let channelLabel = ''
  let status: 'pending' | 'awaiting_proof' = 'awaiting_proof'

  if (input.method === 'express') {
    if (!settings.expressEnabled) throw new SubscriptionError('O Express está desactivado.', 403)
    const origin = process.env.NEXTAUTH_URL || ''
    const charge = await createExpressCharge({
      reference: `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      amount,
      currency: 'AOA',
      description: `${plan.name} · ${interval}`,
      callbackUrl: `${origin}/api/payments/express/webhook`,
    })
    if (!charge.ok) throw new SubscriptionError(charge.message, 503)
    providerRef = charge.providerRef
    checkoutUrl = charge.checkoutUrl
    instructions = 'Pagamento pelo gateway Express.'
    status = 'pending'
  } else if (input.method === 'iban') {
    const channel = settings.banks.find((item: { _id: unknown; active?: boolean; name: string; holder: string; iban: string }) => String(item._id) === input.channelId && item.active !== false)
    if (!channel) {
      throw new SubscriptionError('Nenhuma conta IBAN está publicada. A associação configura os bancos no painel.', 409)
    }
    instructions = `${channel.name} · ${channel.holder} · ${formatIban(channel.iban)}`
    channelId = String(channel._id)
    channelLabel = channel.name
  } else {
    const channel = settings.paypay.find((item: { _id: unknown; active?: boolean; label: string; account: string }) => String(item._id) === input.channelId && item.active !== false)
    if (!channel) {
      throw new SubscriptionError('Nenhuma conta PayPay está publicada. A associação configura o PayPay no painel.', 409)
    }
    instructions = `${channel.label} · ${channel.account}`
    channelId = String(channel._id)
    channelLabel = channel.label
  }

  let subscription = await Subscription.findOne({ user: userId })
  if (!subscription) {
    subscription = await Subscription.create({
      user: userId,
      plan: plan._id,
      planName: plan.name,
      priceAoa: amount,
      billingInterval: interval,
      status: 'pending',
    })
  } else if (subscription.status === 'pending' || subscription.status === 'expired') {
    subscription.plan = plan._id
    subscription.planName = plan.name
    subscription.priceAoa = amount
    subscription.billingInterval = interval
    await subscription.save()
  }

  const transaction = await SubscriptionTransaction.create({
    user: userId,
    subscription: subscription._id,
    plan: plan._id,
    planName: plan.name,
    amount,
    currency: 'AOA',
    billingInterval: interval,
    method: input.method,
    expiresAt: proofDeadline(new Date()),
    status,
    providerRef,
    checkoutUrl,
    instructions,
    channelId,
    channelLabel,
  })
  await recordAudit({
    actorId: userId,
    action: 'subscription.checkout',
    entity: 'subscription',
    entityId: String(subscription._id),
    summary: `${plan.name} · ${interval} · ${input.method} · ${amount} AOA`,
  })
  return {
    transaction: presentTransaction(transaction.toObject()),
    reused: false,
    ...(checkoutUrl ? { checkoutUrl } : {}),
  }
}

export async function attachProof(userId: string, transactionId: string, proofFileId: string, note: string) {
  await connectDB()
  const transaction = await SubscriptionTransaction.findOne({ _id: transactionId, user: userId })
  if (!transaction) throw new SubscriptionError('Transacção não encontrada.', 404)
  if (!['awaiting_proof', 'under_review'].includes(transaction.status)) {
    throw new SubscriptionError('Este pagamento já não aceita comprovativo.', 400)
  }
  if (transaction.expiresAt && transaction.expiresAt.getTime() <= Date.now()) {
    transaction.status = 'expired'
    await transaction.save()
    throw new SubscriptionError('O prazo para enviar o comprovativo terminou.', 400)
  }
  transaction.proofFileId = proofFileId
  transaction.proofNote = note.slice(0, 300)
  transaction.proofUploadedAt = new Date()
  transaction.status = 'under_review'
  await transaction.save()
  await recordAudit({
    actorId: userId,
    action: 'subscription.proof',
    entity: 'subscription_transaction',
    entityId: String(transaction._id),
    summary: transaction.method,
  })
  await notifyUsers([userId], {
    title: 'Comprovativo recebido',
    body: 'A associação vai confirmar o pagamento. A subscrição abre depois dessa confirmação.',
    href: '/painel#plano',
  })
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean()
  await notifyUsers(admins.map((admin) => String(admin._id)), {
    title: 'Comprovativo por confirmar',
    body: 'Há um pagamento de subscrição à espera de confirmação.',
    href: '/admin/subscricoes',
  })
  return presentTransaction(transaction.toObject())
}

export async function userCanReadReceipt(userId: string, role: string, fileId: string) {
  await connectDB()
  if (role === 'admin') {
    const found = await SubscriptionTransaction.exists({ proofFileId: fileId })
    return Boolean(found)
  }
  const found = await SubscriptionTransaction.exists({ proofFileId: fileId, user: userId })
  return Boolean(found)
}

async function paidPeriod(transaction: { plan: unknown; subscription: unknown; billingInterval?: string }, now: Date) {
  const plan = await SubscriptionPlan.findById(transaction.plan).select('name graceDays')
  const subscription = await Subscription.findById(transaction.subscription)
  if (!subscription) throw new SubscriptionError('Subscrição não encontrada.', 404)
  const graceDays = Number.isInteger(plan?.graceDays) ? plan!.graceDays : DEFAULT_GRACE_DAYS
  const interval: BillingInterval = isBillingInterval(transaction.billingInterval || '') ? transaction.billingInterval as BillingInterval : 'month'
  return { plan, subscription, period: nextBillingPeriod(subscription, now, graceDays, interval), interval }
}

export async function confirmTransaction(transactionId: string, actorId: string, note = '') {
  await runSubscriptionLifecycle()
  const transaction = await SubscriptionTransaction.findById(transactionId)
  if (!transaction) throw new SubscriptionError('Transacção não encontrada.', 404)
  if (transaction.method === 'express') throw new SubscriptionError('O Express só fecha pelo gateway.', 400)
  if (transaction.status !== 'under_review' || !transaction.proofFileId) {
    throw new SubscriptionError('Confirme só depois de o comprovativo estar em análise.', 400)
  }

  const now = new Date()
  const { plan, subscription, period, interval } = await paidPeriod(transaction, now)
  const wasSuspended = subscription.status === 'suspended'
  transaction.status = 'paid'
  transaction.paidAt = now
  transaction.periodStart = period.periodStart
  transaction.periodEnd = period.renewsAt
  transaction.reviewedBy = actorId || undefined
  transaction.reviewNote = note.slice(0, 300)
  await transaction.save()

  subscription.plan = transaction.plan
  subscription.planName = plan?.name || transaction.planName
  subscription.priceAoa = transaction.amount
  subscription.billingInterval = interval
  subscription.startedAt = period.startedAt
  subscription.currentPeriodStart = period.periodStart
  subscription.renewsAt = period.renewsAt
  subscription.graceUntil = period.graceUntil
  subscription.paymentMethod = transaction.method
  subscription.lastTransaction = transaction._id
  subscription.notices = []
  if (!wasSuspended) {
    subscription.status = 'active'
    subscription.suspendedAt = undefined
  }
  await subscription.save()
  if (!wasSuspended) await applyAccess(String(subscription.user), true, period.renewsAt)

  await recordAudit({
    actorId,
    action: 'subscription.confirm',
    entity: 'subscription_transaction',
    entityId: String(transaction._id),
    summary: `${transaction.amount} AOA até ${period.renewsAt.toISOString()}`,
  })
  await notifyUsers([String(subscription.user)], {
    title: 'Pagamento confirmado',
    body: wasSuspended
      ? 'O pagamento foi registado. A subscrição continua suspensa até a associação a reactivar.'
      : `O Plano Pro está activo até ${period.renewsAt.toLocaleDateString('pt-AO')}.`,
    href: '/painel#plano',
  })
  return presentTransaction(transaction.toObject())
}

export async function rejectTransaction(transactionId: string, actorId: string, note: string) {
  await connectDB()
  const transaction = await SubscriptionTransaction.findById(transactionId)
  if (!transaction) throw new SubscriptionError('Transacção não encontrada.', 404)
  if (!['awaiting_proof', 'under_review', 'pending'].includes(transaction.status)) {
    throw new SubscriptionError('Esta transacção já foi fechada.', 400)
  }
  transaction.status = 'failed'
  transaction.reviewedBy = actorId || undefined
  transaction.reviewNote = note.slice(0, 300)
  await transaction.save()
  await recordAudit({
    actorId,
    action: 'subscription.reject',
    entity: 'subscription_transaction',
    entityId: String(transaction._id),
    summary: note.slice(0, 180),
  })
  await notifyUsers([String(transaction.user)], {
    title: 'Pagamento recusado',
    body: note ? note.slice(0, 300) : 'A associação não confirmou este pagamento. Pode iniciar outro.',
    href: '/painel#plano',
  })
  return presentTransaction(transaction.toObject())
}

export async function suspendSubscription(subscriptionId: string, actorId: string) {
  await connectDB()
  const subscription = await Subscription.findById(subscriptionId)
  if (!subscription) throw new SubscriptionError('Subscrição não encontrada.', 404)
  if (!['active', 'past_due'].includes(subscription.status)) {
    throw new SubscriptionError('Só uma subscrição activa ou em atraso pode ser suspensa.', 400)
  }
  subscription.status = 'suspended'
  subscription.suspendedAt = new Date()
  await subscription.save()
  await applyAccess(String(subscription.user), false, asDate(subscription.graceUntil) || asDate(subscription.renewsAt))
  await recordAudit({
    actorId,
    action: 'subscription.suspend',
    entity: 'subscription',
    entityId: String(subscription._id),
    summary: subscription.planName,
  })
  await notifyUsers([String(subscription.user)], {
    title: 'Subscrição suspensa',
    body: 'O Plano Pro foi suspenso pela associação.',
    href: '/painel#plano',
  })
  return presentSubscription(subscription.toObject())
}

export async function reactivateSubscription(subscriptionId: string, actorId: string) {
  await connectDB()
  const subscription = await Subscription.findById(subscriptionId)
  if (!subscription) throw new SubscriptionError('Subscrição não encontrada.', 404)
  const now = new Date()
  const decision = reactivation(subscription, now)
  if (!decision.ok) throw new SubscriptionError(decision.reason, 400)
  subscription.status = decision.status
  subscription.suspendedAt = undefined
  await subscription.save()
  const access = subscriptionAccess(subscription, now)
  await applyAccess(String(subscription.user), access.allowed, access.until)
  await recordAudit({
    actorId,
    action: 'subscription.reactivate',
    entity: 'subscription',
    entityId: String(subscription._id),
    summary: subscription.planName,
  })
  await notifyUsers([String(subscription.user)], {
    title: 'Subscrição reactivada',
    body: decision.status === 'active'
      ? 'O Plano Pro voltou a ficar activo.'
      : 'A subscrição foi reactivada e continua dentro do prazo de tolerância.',
    href: '/painel#plano',
  })
  return presentSubscription(subscription.toObject())
}

export async function savePlan(input: {
  name: string
  description: string
  priceAoa: number
  prices: PlanPrices
  features: string[]
  recommended: boolean
  graceDays: number
  active: boolean
  reminderDays: number[]
}, actorId: string, planId?: string) {
  await ensureSubscriptionCatalog()
  const slug = await uniqueSlug(input.name, planId)
  const payload = { ...input, slug, currency: 'AOA', prices: input.prices }
  const plan = planId
    ? await SubscriptionPlan.findByIdAndUpdate(planId, payload, { new: true })
    : await SubscriptionPlan.create(payload)
  if (!plan) throw new SubscriptionError('Plano não encontrado.', 404)
  await recordAudit({
    actorId,
    action: planId ? 'subscription.plan.update' : 'subscription.plan.create',
    entity: 'subscription_plan',
    entityId: String(plan._id),
    summary: `${plan.name} · ${plan.priceAoa} AOA`,
  })
  return presentPlan(plan.toObject())
}

export async function savePaymentSettings(input: {
  expressEnabled: boolean
  banks: Array<{ id: string; name: string; holder: string; iban: string; active: boolean }>
  paypay: Array<{ id: string; label: string; account: string; active: boolean }>
}, actorId: string) {
  const settings = await settingsDoc()
  settings.expressEnabled = input.expressEnabled
  settings.banks = input.banks.map((bank) => ({
    ...(bank.id ? { _id: bank.id } : {}),
    name: bank.name,
    holder: bank.holder,
    iban: bank.iban,
    active: bank.active,
  }))
  settings.paypay = input.paypay.map((account) => ({
    ...(account.id ? { _id: account.id } : {}),
    label: account.label,
    account: account.account,
    active: account.active,
  }))
  await settings.save()
  await recordAudit({
    actorId,
    action: 'payment.settings',
    entity: 'payment_settings',
    entityId: String(settings._id),
    summary: `${input.banks.length} IBAN · ${input.paypay.length} PayPay`,
  })
  return presentSettings(settings.toObject())
}

export async function recordRefund(input: { transactionId: string; amount: number; reason: string }, actorId: string) {
  await connectDB()
  const transaction = await SubscriptionTransaction.findById(input.transactionId)
  if (!transaction) throw new SubscriptionError('Transacção não encontrada.', 404)
  if (transaction.status !== 'paid') {
    throw new SubscriptionError('Só um pagamento confirmado pode ser reembolsado.', 400)
  }
  const remaining = refundableAmount(transaction.amount, transaction.refundedAmount || 0)
  if (input.amount > remaining) throw new SubscriptionError(`O valor em aberto é ${remaining} Kz.`, 400)

  transaction.refundedAmount = (transaction.refundedAmount || 0) + input.amount
  const full = transaction.refundedAmount >= transaction.amount
  if (full) transaction.status = 'refunded'
  await transaction.save()

  const refund = await SubscriptionRefund.create({
    transaction: transaction._id,
    user: transaction.user,
    subscription: transaction.subscription,
    amount: input.amount,
    currency: 'AOA',
    reason: input.reason,
    recordedBy: actorId || undefined,
  })

  const subscription = await Subscription.findById(transaction.subscription)
  const closesPeriod = Boolean(full && subscription && String(subscription.lastTransaction) === String(transaction._id))
  if (closesPeriod && subscription && subscription.status !== 'expired') {
    subscription.status = 'expired'
    await subscription.save()
    await applyAccess(String(subscription.user), false, asDate(subscription.graceUntil) || asDate(subscription.renewsAt))
  }

  await recordAudit({
    actorId,
    action: 'subscription.refund',
    entity: 'subscription_refund',
    entityId: String(refund._id),
    summary: `${input.amount} AOA · ${input.reason}`,
  })
  await notifyUsers([String(transaction.user)], {
    title: 'Reembolso registado',
    body: closesPeriod
      ? `Foi registado um reembolso de ${input.amount} Kz e a subscrição deste período foi encerrada.`
      : `Foi registado um reembolso de ${input.amount} Kz.`,
    href: '/painel#plano',
  })
  return {
    id: String(refund._id),
    amount: refund.amount,
    reason: refund.reason,
    createdAt: refund.createdAt,
  }
}
