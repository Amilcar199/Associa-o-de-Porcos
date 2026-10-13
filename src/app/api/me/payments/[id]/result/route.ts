export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { settlePayment } from '@/lib/settle-payment'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Pagamento inválido')

    const body = sanitizeInput(await req.json())
    if (body.outcome !== 'paid' && body.outcome !== 'failed') return errorResponse('Resultado inválido')

    await connectDB()
    const owned = await Payment.findOne({ _id: params.id, user: userId }).select('_id')
    if (!owned) return errorResponse('Pagamento não encontrado', 404)

    const result = await settlePayment(params.id, body.outcome)
    if ('error' in result && result.error) return errorResponse(result.error, result.status)
    return NextResponse.json(successResponse(result.payment, body.outcome === 'paid' ? 'Pagamento confirmado' : 'Pagamento recusado'))
  } catch (error) {
    console.error('Erro ao fechar pagamento:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
