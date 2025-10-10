export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

// GET /api/news/latest - Buscar últimas notícias
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(limit, 20)
    })
    return NextResponse.json(successResponse(news as any))
  } catch (error) {
    console.error('Erro ao buscar últimas notícias:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
