import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'
import { PIG_BREEDS } from '@/lib/pig-listings'

export type QuoteRequestInput = {
  quantity: number
  saleForm: 'vivo' | 'carcaça'
  breed?: string
  province: string
  phone: string
  note?: string
}

export function parseQuoteRequest(body: Record<string, unknown>): { data?: QuoteRequestInput; error?: string } {
  const quantity = Number(body.quantity)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5000) {
    return { error: 'A quantidade tem de ser um número entre 1 e 5000' }
  }

  const saleForm = body.saleForm === 'carcaça' ? 'carcaça' : body.saleForm === 'vivo' ? 'vivo' : ''
  if (!saleForm) return { error: 'Escolha vivo ou carcaça' }

  const breed = String(body.breed || '').trim()
  if (breed && !PIG_BREEDS.includes(breed as (typeof PIG_BREEDS)[number])) {
    return { error: 'Escolha uma raça de suíno ou deixe em branco' }
  }

  const province = String(body.province || '').trim()
  if (!ANGOLA_PROVINCE_NAMES.includes(province)) return { error: 'Escolha uma província' }

  const phone = String(body.phone || '').replace(/[^\d+]/g, '')
  if (phone.length < 8) return { error: 'O telefone é obrigatório' }

  const note = String(body.note || '').trim().slice(0, 500)

  return {
    data: {
      quantity,
      saleForm,
      breed: breed || undefined,
      province,
      phone,
      note: note || undefined,
    },
  }
}
