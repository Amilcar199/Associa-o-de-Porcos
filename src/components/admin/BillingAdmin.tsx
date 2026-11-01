'use client'

import { FormEvent, useEffect, useState } from 'react'
import { formatAoa, formatIban, INTERVAL_LABELS } from '@/lib/subscriptions'

type PlanPrices = { week: number | null; month: number | null; semester: number | null; year: number | null }

type Plan = {
  id: string
  name: string
  description: string
  priceAoa: number
  prices: PlanPrices
  features: string[]
  recommended: boolean
  active: boolean
  graceDays: number
  reminderDays: number[]
}

type Bank = { id: string; name: string; holder: string; iban: string; active: boolean }
type PayPay = { id: string; label: string; account: string; active: boolean }

type SubscriptionRow = {
  id: string
  status: string
  planName: string
  priceAoa: number
  billingInterval?: 'week' | 'month' | 'semester' | 'year'
  paymentMethod?: string
  startedAt?: string | null
  renewsAt?: string | null
  graceUntil?: string | null
  userName: string
  userEmail: string
}

type TransactionRow = {
  id: string
  amount: number
  method: string
  status: string
  planName: string
  instructions: string
  proofFileId: string
  proofNote: string
  createdAt: string
  paidAt?: string | null
  periodEnd?: string | null
  reviewNote: string
  refundedAmount: number
  refundable: number
  userName: string
  userEmail: string
}

type Billing = {
  plans: Plan[]
  subscriptions: SubscriptionRow[]
  transactions: TransactionRow[]
  refunds: Array<{ id: string; amount: number; reason: string; createdAt: string; userName: string }>
  settings: {
    expressEnabled: boolean
    express: { state: string; missing: string[]; ready: boolean }
    banks: Bank[]
    paypay: PayPay[]
  }
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

const TABS = [
  ['planos', 'Planos'],
  ['subscricoes', 'Subscrições'],
  ['transaccoes', 'Transacções'],
  ['reembolsos', 'Reembolsos'],
  ['canais', 'Contas IBAN e PayPay'],
] as const

function when(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-AO')
}

const emptyPlan = {
  name: '',
  description: '',
  week: '5000',
  month: '15000',
  semester: '75000',
  year: '150000',
  features: 'Publicar anúncios de suínos\nPedir destaque dos anúncios aprovados\nAceder aos conteúdos de membros\nReceber aviso antes da renovação',
  graceDays: '5',
  reminderDays: '7, 3, 1',
  active: true,
  recommended: false,
}

export default function BillingAdmin() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('planos')
  const [data, setData] = useState<Billing | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [planForm, setPlanForm] = useState(emptyPlan)
  const [planId, setPlanId] = useState('')
  const [banks, setBanks] = useState<Bank[]>([])
  const [paypay, setPaypay] = useState<PayPay[]>([])
  const [expressEnabled, setExpressEnabled] = useState(true)
  const [refund, setRefund] = useState({ transactionId: '', amount: '', reason: '' })

  async function load() {
    const response = await fetch('/api/admin/billing', { cache: 'no-store' })
    const json = await response.json()
    if (!response.ok) {
      setError(json.error || 'Não foi possível carregar as subscrições.')
      return
    }
    setError('')
    const next = json.data as Billing
    setData(next)
    setBanks(next.settings.banks)
    setPaypay(next.settings.paypay)
    setExpressEnabled(next.settings.expressEnabled)
  }

  useEffect(() => { load() }, [])

  async function send(url: string, method: string, body: unknown, ok: string) {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Não foi possível guardar.')
        return false
      }
      setMessage(json.message || ok)
      await load()
      return true
    } finally {
      setBusy(false)
    }
  }

  function savePlan(event: FormEvent) {
    event.preventDefault()
    const body = {
      name: planForm.name,
      description: planForm.description,
      prices: {
        week: planForm.week,
        month: planForm.month,
        semester: planForm.semester,
        year: planForm.year,
      },
      features: planForm.features,
      recommended: planForm.recommended,
      graceDays: Number(planForm.graceDays),
      reminderDays: planForm.reminderDays,
      active: planForm.active,
    }
    const url = planId ? `/api/admin/billing/plans/${planId}` : '/api/admin/billing/plans'
    send(url, planId ? 'PATCH' : 'POST', body, 'Plano guardado').then((saved) => {
      if (saved) {
        setPlanId('')
        setPlanForm(emptyPlan)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Subscrições</h1>
        <p className="mt-1 text-gray-600">Cada plano pode ter preço semanal, mensal, de 6 meses e anual. As contas que o membro escolhe ao pagar ficam no separador Contas IBAN e PayPay.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={`rounded-full px-3 py-1.5 text-sm ${tab === id ? 'bg-primary-700 text-white' : 'bg-white text-gray-700'}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-primary-800">{message}</p>}

      {tab === 'planos' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <form className="space-y-3 rounded-xl bg-white p-4" onSubmit={savePlan}>
            <h2 className="font-semibold text-gray-900">{planId ? 'Editar plano' : 'Novo plano'}</h2>
            <input className="input-field" required placeholder="Nome" value={planForm.name} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} />
            <textarea className="input-field" placeholder="Descrição" value={planForm.description} onChange={(event) => setPlanForm({ ...planForm, description: event.target.value })} />
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-sm text-gray-600">Semanal (Kz)
                <input className="input-field" type="number" min={1} step={1} value={planForm.week} onChange={(event) => setPlanForm({ ...planForm, week: event.target.value })} />
              </label>
              <label className="block text-sm text-gray-600">Mensal (Kz)
                <input className="input-field" type="number" min={1} step={1} value={planForm.month} onChange={(event) => setPlanForm({ ...planForm, month: event.target.value })} />
              </label>
              <label className="block text-sm text-gray-600">6 meses (Kz)
                <input className="input-field" type="number" min={1} step={1} value={planForm.semester} onChange={(event) => setPlanForm({ ...planForm, semester: event.target.value })} />
              </label>
              <label className="block text-sm text-gray-600">Anual (Kz)
                <input className="input-field" type="number" min={1} step={1} value={planForm.year} onChange={(event) => setPlanForm({ ...planForm, year: event.target.value })} />
              </label>
            </div>
            <label className="block text-sm text-gray-600">Vantagens, uma por linha
              <textarea className="input-field" value={planForm.features} onChange={(event) => setPlanForm({ ...planForm, features: event.target.value })} />
            </label>
            <label className="block text-sm text-gray-600">Dias de tolerância depois do vencimento
              <input className="input-field" required type="number" min={0} max={30} value={planForm.graceDays} onChange={(event) => setPlanForm({ ...planForm, graceDays: event.target.value })} />
            </label>
            <label className="block text-sm text-gray-600">Avisos antes do vencimento, em dias
              <input className="input-field" required value={planForm.reminderDays} onChange={(event) => setPlanForm({ ...planForm, reminderDays: event.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={planForm.active} onChange={(event) => setPlanForm({ ...planForm, active: event.target.checked })} />
              Plano visível para os membros
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={planForm.recommended} onChange={(event) => setPlanForm({ ...planForm, recommended: event.target.checked })} />
              Marcar como recomendado
            </label>
            <p className="text-sm text-gray-500">Deixe um preço vazio para não oferecer esse período. O cartão na área do produtor mostra a descrição, o preço e estas vantagens.</p>
            <div className="flex gap-2">
              <button className="btn-primary" type="submit" disabled={busy}>Guardar</button>
              {planId && <button className="btn-secondary" type="button" onClick={() => { setPlanId(''); setPlanForm(emptyPlan) }}>Cancelar</button>}
            </div>
          </form>
          <div className="space-y-3">
            {(data?.plans || []).map((plan) => (
              <article key={plan.id} className="rounded-xl bg-white p-4">
                <p className="font-medium text-gray-900">{plan.name} · {plan.active ? 'Activo' : 'Oculto'}{plan.recommended ? ' · Recomendado' : ''}</p>
                <p className="text-sm text-gray-500">
                  {(['week', 'month', 'semester', 'year'] as const).filter((interval) => plan.prices?.[interval]).map((interval) => `${INTERVAL_LABELS[interval]} ${formatAoa(plan.prices[interval] || 0)}`).join(' · ')}
                </p>
                <p className="text-sm text-gray-500">Tolerância {plan.graceDays} dias · avisos {plan.reminderDays.join(', ')} dias antes</p>
                {plan.description && <p className="mt-1 text-sm text-gray-600">{plan.description}</p>}
                {plan.features.length > 0 && <ul className="mt-2 text-sm text-gray-600">{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>}
                <button type="button" className="mt-3 rounded-lg border px-3 py-1.5 text-sm" onClick={() => {
                  setPlanId(plan.id)
                  setPlanForm({
                    name: plan.name,
                    description: plan.description,
                    week: plan.prices.week ? String(plan.prices.week) : '',
                    month: plan.prices.month ? String(plan.prices.month) : '',
                    semester: plan.prices.semester ? String(plan.prices.semester) : '',
                    year: plan.prices.year ? String(plan.prices.year) : '',
                    features: plan.features.join('\n'),
                    graceDays: String(plan.graceDays),
                    reminderDays: plan.reminderDays.join(', '),
                    active: plan.active,
                    recommended: plan.recommended,
                  })
                }}>Editar</button>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'subscricoes' && (
        <div className="overflow-x-auto rounded-xl bg-white">
          <p className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600">Registo de quem iniciou ou pagou uma subscrição. O Plano Pro dado à mão, sem pagamento, continua em Planos.</p>
          {(data?.subscriptions || []).length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500">Ainda não há subscritores. A lista enche quando alguém escolhe um plano e inicia o pagamento.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Conta</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium">Período</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Início</th>
                  <th className="px-4 py-3 font-medium">Renovação</th>
                  <th className="px-4 py-3 font-medium">Pagamento</th>
                  <th className="px-4 py-3 font-medium">Controlo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.subscriptions || []).map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{row.userName || 'Conta'}</p>
                      <p className="text-gray-500">{row.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">{row.planName || '—'}{row.priceAoa ? ` · ${formatAoa(row.priceAoa)}` : ''}</td>
                    <td className="px-4 py-3">{INTERVAL_LABELS[row.billingInterval || 'month']}</td>
                    <td className="px-4 py-3">{STATUS[row.status] || row.status}{row.status === 'past_due' ? ` · até ${when(row.graceUntil)}` : ''}</td>
                    <td className="px-4 py-3">{when(row.startedAt)}</td>
                    <td className="px-4 py-3">{when(row.renewsAt)}</td>
                    <td className="px-4 py-3">{row.paymentMethod || '—'}</td>
                    <td className="px-4 py-3">
                      {(row.status === 'active' || row.status === 'past_due') && (
                        <button type="button" className="rounded-lg border px-3 py-1.5" disabled={busy} onClick={() => send(`/api/admin/billing/subscriptions/${row.id}`, 'PATCH', { action: 'suspend' }, 'Subscrição suspensa')}>Suspender</button>
                      )}
                      {row.status === 'suspended' && (
                        <button type="button" className="rounded-lg border px-3 py-1.5" disabled={busy} onClick={() => send(`/api/admin/billing/subscriptions/${row.id}`, 'PATCH', { action: 'reactivate' }, 'Subscrição reactivada')}>Reactivar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'transaccoes' && (
        <div className="space-y-3">
          {(data?.transactions || []).length === 0 && <p className="text-sm text-gray-500">Ainda não há transacções.</p>}
          {(data?.transactions || []).map((row) => (
            <article key={row.id} className="rounded-xl bg-white p-4">
              <p className="font-medium text-gray-900">{row.userName || 'Conta'} · {row.planName} · {formatAoa(row.amount)} · {row.method} · {STATUS[row.status] || row.status}</p>
              <p className="text-sm text-gray-500">{row.userEmail} · {when(row.createdAt)}{row.periodEnd ? ` · período até ${when(row.periodEnd)}` : ''}{row.refundedAmount ? ` · reembolsado ${formatAoa(row.refundedAmount)}` : ''}</p>
              {row.instructions && <p className="mt-1 text-sm text-gray-700">{row.instructions}</p>}
              {row.proofNote && <p className="text-sm text-gray-600">Nota: {row.proofNote}</p>}
              {row.reviewNote && <p className="text-sm text-gray-600">Revisão: {row.reviewNote}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {row.proofFileId && <a className="rounded-lg border px-3 py-1.5 text-sm" href={`/api/billing/receipts/${row.proofFileId}`} target="_blank" rel="noreferrer">Abrir comprovativo</a>}
                {row.status === 'under_review' && row.method !== 'express' && (
                  <button type="button" className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white" disabled={busy} onClick={() => send(`/api/admin/billing/transactions/${row.id}`, 'PATCH', { action: 'confirm' }, 'Pagamento confirmado')}>Confirmar pagamento</button>
                )}
                {['awaiting_proof', 'under_review', 'pending'].includes(row.status) && (
                  <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" disabled={busy} onClick={() => {
                    const note = window.prompt('Motivo da recusa', '')
                    if (note == null) return
                    send(`/api/admin/billing/transactions/${row.id}`, 'PATCH', { action: 'reject', note }, 'Pagamento recusado')
                  }}>Recusar</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'reembolsos' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form className="space-y-3 rounded-xl bg-white p-4" onSubmit={(event) => {
            event.preventDefault()
            send('/api/admin/billing/refunds', 'POST', {
              transactionId: refund.transactionId,
              amount: Number(refund.amount),
              reason: refund.reason,
            }, 'Reembolso registado').then((saved) => { if (saved) setRefund({ transactionId: '', amount: '', reason: '' }) })
          }}>
            <h2 className="font-semibold text-gray-900">Registar reembolso</h2>
            <select className="input-field" required value={refund.transactionId} onChange={(event) => {
              const transaction = data?.transactions.find((row) => row.id === event.target.value)
              setRefund({ transactionId: event.target.value, amount: transaction ? String(transaction.refundable) : '', reason: refund.reason })
            }}>
              <option value="">Pagamento confirmado</option>
              {(data?.transactions || []).filter((row) => row.refundable > 0 && (row.status === 'paid' || row.status === 'refunded')).map((row) => (
                <option key={row.id} value={row.id}>{row.userName} · {formatAoa(row.refundable)} em aberto · {when(row.paidAt || row.createdAt)}</option>
              ))}
            </select>
            <input className="input-field" required type="number" min={1} step={1} placeholder="Valor em kwanzas" value={refund.amount} onChange={(event) => setRefund({ ...refund, amount: event.target.value })} />
            <textarea className="input-field" required minLength={3} placeholder="Motivo" value={refund.reason} onChange={(event) => setRefund({ ...refund, reason: event.target.value })} />
            <p className="text-sm text-gray-500">Um reembolso total do período corrente encerra a subscrição. O valor fica só registado; não sai por um gateway.</p>
            <button className="btn-primary" type="submit" disabled={busy}>Registar</button>
          </form>
          <div className="space-y-3">
            {(data?.refunds || []).map((row) => (
              <article key={row.id} className="rounded-xl bg-white p-4">
                <p className="font-medium text-gray-900">{row.userName || 'Conta'} · {formatAoa(row.amount)}</p>
                <p className="text-sm text-gray-500">{when(row.createdAt)} · {row.reason}</p>
              </article>
            ))}
            {(data?.refunds || []).length === 0 && <p className="text-sm text-gray-500">Ainda não há reembolsos.</p>}
          </div>
        </div>
      )}

      {tab === 'canais' && (
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault()
          send('/api/admin/billing/settings', 'PUT', { expressEnabled, banks, paypay }, 'Contas actualizadas')
        }}>
          <article className="rounded-xl bg-white p-4">
            <h2 className="font-semibold text-gray-900">Contas que aparecem no pagamento</h2>
            <p className="mt-1 text-sm text-gray-600">O que gravar aqui é o que o membro vê ao escolher IBAN ou PayPay. Pode adicionar, editar, desactivar ou remover. O Express continua à espera do gateway.</p>
          </article>
          <article className="rounded-xl bg-white p-4">
            <h2 className="font-semibold text-gray-900">Express</h2>
            <p className="mt-1 text-sm text-gray-600">
              {data?.settings.express.state === 'awaiting_credentials'
                ? `A aguardar credenciais: ${data.settings.express.missing.join(', ')}.`
                : 'As credenciais existem, mas o cliente do gateway ainda não está ligado.'}
              {' '}Nenhum pagamento Express é confirmado até essa integração.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={expressEnabled} onChange={(event) => setExpressEnabled(event.target.checked)} />
              Mostrar Express aos membros
            </label>
          </article>

          <article className="space-y-3 rounded-xl bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">Contas IBAN</h2>
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => setBanks([...banks, { id: '', name: '', holder: '', iban: '', active: true }])}>Adicionar banco</button>
            </div>
            {banks.length === 0 && <p className="text-sm text-gray-500">Sem bancos publicados. Os membros só pagam por IBAN depois de gravar uma conta.</p>}
            {banks.map((bank, index) => (
              <div key={`${bank.id}-${index}`} className="grid gap-2 md:grid-cols-4">
                <input className="input-field" placeholder="Banco" value={bank.name} onChange={(event) => setBanks(banks.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} />
                <input className="input-field" placeholder="Titular" value={bank.holder} onChange={(event) => setBanks(banks.map((item, itemIndex) => itemIndex === index ? { ...item, holder: event.target.value } : item))} />
                <input className="input-field" placeholder="IBAN AO" value={bank.iban} onChange={(event) => setBanks(banks.map((item, itemIndex) => itemIndex === index ? { ...item, iban: event.target.value } : item))} />
                <div className="flex items-center gap-3 text-sm">
                  <label><input type="checkbox" checked={bank.active} onChange={(event) => setBanks(banks.map((item, itemIndex) => itemIndex === index ? { ...item, active: event.target.checked } : item))} /> Activa</label>
                  <button type="button" className="text-red-600" onClick={() => setBanks(banks.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>
                  {bank.iban && <span className="text-gray-400">{formatIban(bank.iban)}</span>}
                </div>
              </div>
            ))}
          </article>

          <article className="space-y-3 rounded-xl bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">PayPay</h2>
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => setPaypay([...paypay, { id: '', label: '', account: '', active: true }])}>Adicionar conta</button>
            </div>
            {paypay.length === 0 && <p className="text-sm text-gray-500">Sem contas PayPay. Publique o número quando estiver disponível.</p>}
            {paypay.map((account, index) => (
              <div key={`${account.id}-${index}`} className="grid gap-2 md:grid-cols-3">
                <input className="input-field" placeholder="Nome" value={account.label} onChange={(event) => setPaypay(paypay.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
                <input className="input-field" placeholder="Número" value={account.account} onChange={(event) => setPaypay(paypay.map((item, itemIndex) => itemIndex === index ? { ...item, account: event.target.value } : item))} />
                <div className="flex items-center gap-3 text-sm">
                  <label><input type="checkbox" checked={account.active} onChange={(event) => setPaypay(paypay.map((item, itemIndex) => itemIndex === index ? { ...item, active: event.target.checked } : item))} /> Activa</label>
                  <button type="button" className="text-red-600" onClick={() => setPaypay(paypay.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>
                </div>
              </div>
            ))}
          </article>
          <button className="btn-primary" type="submit" disabled={busy}>Guardar canais</button>
        </form>
      )}
    </div>
  )
}
