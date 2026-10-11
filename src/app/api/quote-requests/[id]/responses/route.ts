export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import QuoteResponse from '@/models/QuoteResponse'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { parseQuoteResponse } from '@/lib/quote-responses'
import { notifyUsers } from '@/lib/notify-users'
import { rateLimitOrNull } from '@/lib/rate-limit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimitOrNull(req, { key: 'quote-response', limit: 20, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    const role = (session as any)?.user?.role
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)
    if (role !== 'member' && role !== 'admin') return errorResponse('Só um produtor associado pode responder', 403)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Pedido inválido')

    const parsed = parseQuoteResponse(sanitizeInput(await req.json()))
    if (!parsed.data) return errorResponse(parsed.error || 'Dados inválidos')

    await connectDB()
    const quote = await QuoteRequest.findOne({ _id: params.id, status: 'open' }).select('buyer')
    if (!quote) return errorResponse('Pedido não encontrado', 404)
    if (String(quote.buyer) === String(userId)) return errorResponse('Não pode responder ao próprio pedido')

    const response = await QuoteResponse.findOneAndUpdate(
      { quoteRequest: quote._id, producer: userId },
      { ...parsed.data, quoteRequest: quote._id, producer: userId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    try {
      await notifyUsers([String(quote.buyer)], {
        title: 'Resposta à sua cotação',
        body: `Um produtor respondeu: ${parsed.data.quantity} animais por ${parsed.data.price} AOA.`,
        href: '/comprador',
      })
    } catch (error) {
      console.error('Aviso de resposta não enviado:', error)
    }

    return NextResponse.json(successResponse(response, 'Resposta enviada ao comprador'), { status: 201 })
  } catch (error) {
    console.error('Erro ao responder à cotação:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
