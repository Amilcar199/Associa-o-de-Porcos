'use client'

import { FormEvent, useEffect, useState } from 'react'
import { BILLING_INTERVALS, formatAoa, formatIban, INTERVAL_LABELS, monthlyEquivalent, type BillingInterval } from '@/lib/subscriptions'

type Plan = {
  id: string
  name: string
  description: string
  priceAoa: number
  prices: Record<BillingInterval, number | null>
  features: string[]
  recommended: boolean
  graceDays: number
}

type ChannelBank = { id: string; name: string; holder: string; iban: string }
type ChannelPayPay = { id: string; label: string; account: string }

type Transaction = {
  id: string
  amount: number
  billingInterval?: BillingInterval
  method: string
  status: string
  planName: string
  instructions: string
  checkoutUrl: string
  proofFileId: string
  periodEnd?: string | null
  paidAt?: string | null
  createdAt: string
  expiresAt?: string | null
  reviewNote?: string
  refundedAmount: number
}

type Billing = {
  subscription: {
    status: string
    planName: string
    priceAoa: number
    billingInterval?: BillingInterval
    startedAt?: string | null
    renewsAt?: string | null
    graceUntil?: string | null
    paymentMethod?: string
  } | null
  plans: Plan[]
  channels: {
    express: { enabled: boolean; ready: boolean }
    banks: ChannelBank[]
    paypay: ChannelPayPay[]
  }
  transactions: Transaction[]
  refunds: Array<{ id: string; amount: number; reason: string; createdAt: string }>
}

const STATUS: Record<string, string> = {
  pending: 'Aguarda pagamento',
  active: 'Activa',
  past_due: 'Em atraso',
  suspended: 'Suspensa',
  expired: 'Expirada',
  awaiting_proof: 'Aguarda comprovativo',
  under_review: 'Em análise',
  paid: 'Pago',
  failed: 'Recusado',
  refunded: 'Reembolsado',
}

const METHOD: Record<string, string> = {
  express: 'Express',
  iban: 'IBAN',
  paypay: 'PayPay',
}

const OPEN = new Set(['pending', 'awaiting_proof', 'under_review'])

function when(value?: string | null, locale = 'pt-AO') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale)
}

export default function SubscriptionPanel({ isEn = false, onChanged }: { isEn?: boolean; onChanged?: () => void }) {
  const [data, setData] = useState<Billing | null>(null)
  const [planId, setPlanId] = useState('')
  const [duration, setDuration] = useState<BillingInterval>('month')
  const [method, setMethod] = useState<'express' | 'iban' | 'paypay'>('iban')
  const [channelId, setChannelId] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const locale = isEn ? 'en' : 'pt-AO'
  const t = (pt: string, en: string) => (isEn ? en : pt)

  async function load() {
    const response = await fetch('/api/me/subscription', { cache: 'no-store' })
    const json = await response.json()
    if (!response.ok) {
      setError(json.error || t('Não foi possível carregar a subscrição.', 'Could not load the subscription.'))
      return
    }
    setError('')
    const next = json.data as Billing
    setData(next)
    setPlanId((current) => current || next.plans[0]?.id || '')
    setChannelId((current) => current || next.channels.banks[0]?.id || '')
  }

  useEffect(() => { load() }, [])

  const open = data?.transactions.find((row) => OPEN.has(row.status) && (!row.expiresAt || new Date(row.expiresAt).getTime() > Date.now()))
  const banks = data?.channels.banks || []
  const paypay = data?.channels.paypay || []
  const missingAccount = (method === 'iban' && banks.length === 0) || (method === 'paypay' && paypay.length === 0)

  function chooseMethod(next: 'express' | 'iban' | 'paypay') {
    setError('')
    setMethod(next)
    if (next === 'iban') setChannelId(banks[0]?.id || '')
    else if (next === 'paypay') setChannelId(paypay[0]?.id || '')
    else setChannelId('')
  }

  async function pay(event: FormEvent) {
    event.preventDefault()
    if (missingAccount) return
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const response = await fetch('/api/me/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, method, channelId, interval: duration }),
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || t('Não foi possível iniciar o pagamento.', 'Could not start the payment.'))
        return
      }
      if (json.data?.checkoutUrl) {
        window.location.assign(json.data.checkoutUrl)
        return
      }
      setMessage(json.message || t('Pagamento iniciado.', 'Payment started.'))
      await load()
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  async function sendProof(event: FormEvent) {
    event.preventDefault()
    if (!open) return
    const form = event.currentTarget as HTMLFormElement
    const file = new FormData(form).get('file')
    if (!(file instanceof File) || file.size === 0) {
      setError(t('Escolha o comprovativo.', 'Choose the receipt.'))
      return
    }
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const body = new FormData()
      body.set('transactionId', open.id)
      body.set('file', file)
      body.set('note', note)
      const response = await fetch('/api/me/subscription/proof', { method: 'POST', body })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || t('Não foi possível enviar o comprovativo.', 'Could not send the receipt.'))
        return
      }
      setMessage(t('Comprovativo enviado. A associação confirma o pagamento.', 'Receipt sent. The association confirms the payment.'))
      setNote('')
      form.reset()
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {data?.subscription && (
        <div className="rounded-xl bg-white/80 p-3 text-sm text-gray-700">
          <p className="font-medium text-gray-900">
            {data.subscription.planName || t('Subscrição', 'Subscription')} · {STATUS[data.subscription.status] || data.subscription.status}
            {data.subscription.priceAoa ? ` · ${formatAoa(data.subscription.priceAoa)}` : ''}
          </p>
          <p className="mt-1">
            {data.subscription.startedAt ? `${t('Início', 'Start')} ${when(data.subscription.startedAt, locale)}` : t('Ainda sem início', 'Not started')}
            {data.subscription.renewsAt ? ` · ${t('Renovação', 'Renewal')} ${when(data.subscription.renewsAt, locale)}` : ''}
            {data.subscription.status === 'past_due' && data.subscription.graceUntil ? ` · ${t('tolerância até', 'grace until')} ${when(data.subscription.graceUntil, locale)}` : ''}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-primary-800">{message}</p>}

      {open && (
        <div className="rounded-xl border border-amber-200 bg-white p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">{t('Passo seguinte', 'Next step')}</p>
          <p className="mt-1 font-medium text-gray-900">
            {open.planName} · {INTERVAL_LABELS[open.billingInterval || 'month']} · {formatAoa(open.amount)} · {METHOD[open.method] || open.method}
          </p>
          <p className="mt-1 text-gray-600">{t('O pagamento foi registado. Envie o comprovativo para a associação confirmar.', 'The payment was recorded. Send the receipt so the association can confirm it.')}</p>
          {open.instructions && <p className="mt-1 whitespace-pre-wrap text-gray-700">{open.instructions}</p>}
          {open.checkoutUrl && (
            <a className="mt-2 inline-block font-medium text-primary-700 underline" href={open.checkoutUrl}>
              {t('Continuar no Express', 'Continue in Express')}
            </a>
          )}
          {(open.status === 'awaiting_proof' || open.status === 'under_review') && (
            <form className="mt-3 space-y-2" onSubmit={sendProof}>
              <label className="block text-gray-600">
                {t('Comprovativo (imagem ou PDF, até 5MB)', 'Receipt (image or PDF, up to 5MB)')}
                <input className="mt-1 block w-full text-sm" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" />
              </label>
              <input className="input-field" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('Nota opcional', 'Optional note')} />
              <button className="btn-primary" type="submit" disabled={busy}>{t('Enviar comprovativo', 'Send receipt')}</button>
            </form>
          )}
          {open.proofFileId && (
            <a className="mt-2 inline-block text-primary-700 underline" href={`/api/billing/receipts/${open.proofFileId}`} target="_blank" rel="noreferrer">
              {t('Ver comprovativo', 'View receipt')}
            </a>
          )}
        </div>
      )}

      {!open && (
        <form className="space-y-4" onSubmit={pay}>
          <div className="inline-flex flex-wrap rounded-full bg-white p-1 text-sm">
            {BILLING_INTERVALS.filter((interval) => (data?.plans || []).some((plan) => plan.prices?.[interval])).map((interval) => (
              <button
                key={interval}
                type="button"
                className={`rounded-full px-3 py-1.5 ${duration === interval ? 'bg-primary-600 text-white' : 'text-gray-700'}`}
                onClick={() => {
                  setDuration(interval)
                  setError('')
                  const stillThere = (data?.plans || []).some((plan) => plan.id === planId && plan.prices?.[interval])
                  if (!stillThere) setPlanId((data?.plans || []).find((plan) => plan.prices?.[interval])?.id || '')
                }}
              >
                {INTERVAL_LABELS[interval]}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(data?.plans || []).filter((plan) => plan.prices?.[duration]).map((plan) => {
              const price = plan.prices[duration] || 0
              const perMonth = monthlyEquivalent(price, duration)
              const selected = planId === plan.id
              return (
                <article key={plan.id} className={`rounded-2xl border bg-white p-4 ${selected ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
                  {plan.recommended && <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{t('Recomendado', 'Recommended')}</p>}
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">{plan.name}</h3>
                  {plan.description && <p className="mt-1 text-sm text-gray-600">{plan.description}</p>}
                  <p className="mt-3 text-3xl font-semibold text-gray-900">{formatAoa(price)}</p>
                  <p className="text-sm text-gray-500">{INTERVAL_LABELS[duration]}{perMonth ? ` · ${formatAoa(perMonth)}/${t('mês', 'month')}` : ''}</p>
                  {plan.features.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
                      {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
                    </ul>
                  )}
                  <button type="button" className={`mt-4 w-full rounded-full px-4 py-2 text-sm font-medium ${selected ? 'bg-primary-600 text-white' : 'border border-primary-600 text-primary-700'}`} onClick={() => setPlanId(plan.id)}>
                    {selected ? t('Plano escolhido', 'Plan selected') : t('Escolher este plano', 'Choose this plan')}
                  </button>
                </article>
              )
            })}
          </div>
          {data && data.plans.every((plan) => !plan.prices?.[duration]) && <p className="text-sm text-gray-600">{t('Não há planos neste período.', 'There are no plans for this period.')}</p>}

          <div className="rounded-2xl bg-white p-4">
            <h3 className="font-semibold text-gray-900">{t('Pagamento', 'Payment')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('Escolha o meio. No IBAN ou PayPay, escolha uma das contas publicadas e, a seguir, envie o comprovativo.', 'Choose a method. For IBAN or PayPay, pick one of the published accounts and then send the receipt.')}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {data?.channels.express.enabled && (
                <label className="rounded-full bg-gray-50 px-3 py-1.5">
                  <input className="mr-1" type="radio" name="method" checked={method === 'express'} onChange={() => chooseMethod('express')} />
                  Express
                </label>
              )}
              <label className="rounded-full bg-gray-50 px-3 py-1.5">
                <input className="mr-1" type="radio" name="method" checked={method === 'iban'} onChange={() => chooseMethod('iban')} />
                IBAN
              </label>
              <label className="rounded-full bg-gray-50 px-3 py-1.5">
                <input className="mr-1" type="radio" name="method" checked={method === 'paypay'} onChange={() => chooseMethod('paypay')} />
                PayPay
              </label>
            </div>

            {method === 'express' && (
              <p className="mt-3 text-sm text-gray-600">{t('O Express fica pronto para o gateway. Enquanto não estiver ligado, o pagamento não é criado.', 'Express is ready for the gateway. Until it is connected, the payment is not created.')}</p>
            )}
            {method === 'iban' && banks.length === 0 && (
              <p className="mt-3 text-sm text-gray-700">{t('O IBAN ainda não pode receber pagamentos. Falta publicar o banco em Admin, Subscrições, no separador Express, IBAN e PayPay.', 'IBAN cannot take payments yet. Publish a bank under Admin, Subscriptions, on the Express, IBAN and PayPay tab.')}</p>
            )}
            {method === 'iban' && banks.length > 0 && (
              <div className="mt-3 grid gap-2">
                {banks.map((bank) => (
                  <label key={bank.id} className={`cursor-pointer rounded-xl border p-3 text-sm ${channelId === bank.id ? 'border-primary-500' : 'border-gray-200'}`}>
                    <input className="mr-2" type="radio" name="bank" checked={channelId === bank.id} onChange={() => setChannelId(bank.id)} />
                    <span className="font-medium text-gray-900">{bank.name}</span>
                    <span className="mt-1 block text-gray-600">{bank.holder}</span>
                    <span className="block text-gray-800">{formatIban(bank.iban)}</span>
                  </label>
                ))}
              </div>
            )}
            {method === 'paypay' && paypay.length === 0 && (
              <p className="mt-3 text-sm text-gray-700">{t('O PayPay ainda não pode receber pagamentos. Falta publicar a conta em Admin, Subscrições, no separador Express, IBAN e PayPay.', 'PayPay cannot take payments yet. Publish an account under Admin, Subscriptions, on the Express, IBAN and PayPay tab.')}</p>
            )}
            {method === 'paypay' && paypay.length > 0 && (
              <div className="mt-3 grid gap-2">
                {paypay.map((account) => (
                  <label key={account.id} className={`cursor-pointer rounded-xl border p-3 text-sm ${channelId === account.id ? 'border-primary-500' : 'border-gray-200'}`}>
                    <input className="mr-2" type="radio" name="paypay" checked={channelId === account.id} onChange={() => setChannelId(account.id)} />
                    <span className="font-medium text-gray-900">{account.label}</span>
                    <span className="mt-1 block text-gray-600">{account.account}</span>
                  </label>
                ))}
              </div>
            )}

            <button className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={busy || !planId || missingAccount}>
              {t('Pagar e enviar comprovativo', 'Pay and send receipt')}
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900">{t('Histórico', 'History')}</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          {(data?.transactions || []).map((row) => (
            <li key={row.id}>
              {when(row.createdAt, locale)} · {row.planName} · {formatAoa(row.amount)} · {METHOD[row.method] || row.method} · {STATUS[row.status] || row.status}
              {row.periodEnd ? ` · ${t('até', 'until')} ${when(row.periodEnd, locale)}` : ''}
              {row.refundedAmount > 0 ? ` · ${t('reembolsado', 'refunded')} ${formatAoa(row.refundedAmount)}` : ''}
            </li>
          ))}
          {data && data.transactions.length === 0 && <li>{t('Ainda não há transacções.', 'No transactions yet.')}</li>}
        </ul>
        {(data?.refunds || []).length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {data?.refunds.map((refund) => (
              <li key={refund.id}>{when(refund.createdAt, locale)} · {t('Reembolso', 'Refund')} {formatAoa(refund.amount)} · {refund.reason}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
