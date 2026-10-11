export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import QuoteResponse from '@/models/QuoteResponse'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId || (role !== 'member' && role !== 'admin')) {
      return errorResponse('Não autorizado', 401)
    }

    await connectDB()
    const items = await QuoteRequest.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('buyer', 'name')
      .lean()
    const mine = await QuoteResponse.find({ producer: userId, quoteRequest: { $in: items.map((item) => item._id) } }).lean()
    const byQuote = new Map(mine.map((item) => [String(item.quoteRequest), item]))
    const withMine = items.map((item) => ({ ...item, myResponse: byQuote.get(String(item._id)) || null }))
    return NextResponse.json(successResponse(withMine))
  } catch (error) {
    console.error('Erro ao listar procura aberta:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
