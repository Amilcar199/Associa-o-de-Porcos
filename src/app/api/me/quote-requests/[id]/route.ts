export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Pedido inválido')

    const body = await req.json()
    if (body.status !== 'closed') return errorResponse('Só é possível fechar o pedido')

    await connectDB()
    const item = await QuoteRequest.findOneAndUpdate(
      { _id: params.id, buyer: userId, status: 'open' },
      { status: 'closed' },
      { new: true }
    )
    if (!item) return errorResponse('Pedido não encontrado', 404)
    return NextResponse.json(successResponse(item, 'Pedido fechado'))
  } catch (error) {
    console.error('Erro ao fechar pedido de cotação:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
