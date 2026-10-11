export type QuoteResponseInput = {
  price: number
  quantity: number
  phone: string
  message?: string
}

export function parseQuoteResponse(body: Record<string, unknown>): { data?: QuoteResponseInput; error?: string } {
  const price = Number(body.price)
  if (!Number.isFinite(price) || price <= 0) return { error: 'Indique um preço maior que zero' }

  const quantity = Number(body.quantity)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5000) {
    return { error: 'A quantidade tem de ser um número entre 1 e 5000' }
  }

  const phone = String(body.phone || '').replace(/[^\d+]/g, '')
  if (phone.length < 8) return { error: 'O telefone é obrigatório' }

  const message = String(body.message || '').trim().slice(0, 500)
  return { data: { price, quantity, phone, message: message || undefined } }
}
