export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/news/[id]/views - Incrementar visualizações de uma notícia
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const news = await prisma.news.findUnique({ where: { id } })

    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    if (!news.published) {
      return errorResponse('Notícia não está publicada', 400)
    }

    await prisma.news.update({ where: { id }, data: { views: { increment: 1 } } })

    return NextResponse.json(
      successResponse({ views: news.views }, 'Visualizações incrementadas')
    )
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// GET /api/news/[id]/views - Obter número de visualizações de uma notícia
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const news = await prisma.news.findUnique({ where: { id }, select: { views: true, published: true } })

    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    if (!news.published) {
      return errorResponse('Notícia não está publicada', 400)
    }

    return NextResponse.json(successResponse({ views: news.views || 0 }))
  } catch (error) {
    console.error('Erro ao buscar visualizações:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}