export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import { errorResponse, successResponse, validateSession } from '@/lib/api-utils'
import { expireDuePayments } from '@/lib/settle-payment'

export async function GET(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    await connectDB()
    await expireDuePayments()
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email')
      .populate('product', 'name')
      .lean()
    return NextResponse.json(successResponse(payments))
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
