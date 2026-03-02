import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

// GET /api/products/featured - Buscar produtos em destaque
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '6')
    const products = await prisma.product.findMany({
      where: { isActive: true, availability: 'available' },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 20)
    })
    return NextResponse.json(successResponse(products as any))
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
