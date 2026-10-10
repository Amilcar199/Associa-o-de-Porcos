export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    if (!session?.user || (role !== 'member' && role !== 'admin')) {
      return errorResponse('Não autorizado', 401)
    }

    await connectDB()
    const items = await QuoteRequest.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('buyer', 'name')
      .lean()
    return NextResponse.json(successResponse(items))
  } catch (error) {
    console.error('Erro ao listar procura aberta:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
