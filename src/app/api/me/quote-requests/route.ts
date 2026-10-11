export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import QuoteResponse from '@/models/QuoteResponse'
import User from '@/models/User'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { notifyUsers } from '@/lib/notify-users'
import { parseQuoteRequest } from '@/lib/quote-requests'
import { rateLimitOrNull } from '@/lib/rate-limit'

async function buyerId() {
  const session = await getServerSession(authOptions)
  const id = (session as any)?.user?.id
  if (!session?.user || !id) return null
  return String(id)
}

export async function GET() {
  try {
    const userId = await buyerId()
    if (!userId) return errorResponse('Não autorizado', 401)
    await connectDB()
    const items = await QuoteRequest.find({ buyer: userId }).sort({ createdAt: -1 }).limit(50).lean()
    const ids = items.map((item) => item._id)
    const responses = await QuoteResponse.find({ quoteRequest: { $in: ids } })
      .sort({ createdAt: -1 })
      .populate('producer', 'name')
      .select('quoteRequest producer price quantity phone message createdAt')
      .lean()
    const grouped = new Map<string, typeof responses>()
    for (const response of responses) {
      const key = String(response.quoteRequest)
      grouped.set(key, [...(grouped.get(key) || []), response])
    }
    const withResponses = items.map((item) => ({ ...item, responses: grouped.get(String(item._id)) || [] }))
    return NextResponse.json(successResponse(withResponses))
  } catch (error) {
    console.error('Erro ao listar pedidos de cotação:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'quote-request', limit: 8, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const userId = await buyerId()
    if (!userId) return errorResponse('Não autorizado', 401)
    const parsed = parseQuoteRequest(sanitizeInput(await req.json()))
    if (!parsed.data) return errorResponse(parsed.error || 'Dados inválidos')

    await connectDB()
    const item = await QuoteRequest.create({ ...parsed.data, buyer: userId, status: 'open' })
    const producers = await User.find({ role: { $in: ['member', 'admin'] }, isActive: true, _id: { $ne: userId } }).select('_id').lean()
    try {
      await notifyUsers(producers.map((producer) => String(producer._id)), {
        title: 'Nova procura de suínos',
        body: `${parsed.data.quantity} ${parsed.data.saleForm} em ${parsed.data.province}`,
        href: '/painel',
      })
    } catch (error) {
      console.error('Aviso de procura não enviado:', error)
    }
    return NextResponse.json(successResponse(item, 'Pedido de cotação publicado'), { status: 201 })
  } catch (error) {
    console.error('Erro ao publicar pedido de cotação:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
