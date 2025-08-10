import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { successResponse, errorResponse } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

// GET /api/products/featured - Buscar produtos em destaque
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    const products = await Product.find({ 
      isActive: true, 
      availability: 'available' 
    })
    .populate('seller', 'name email phone company avatar')
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 20)) // Máximo 20 produtos
    .lean()

    return NextResponse.json(successResponse(products))
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
