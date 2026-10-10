export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    await connectDB()
    const items = await QuoteRequest.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('buyer', 'name email')
      .lean()
    return NextResponse.json(successResponse(items))
  } catch (error) {
    console.error('Erro ao listar pedidos de cotação no admin:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
