export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import { errorResponse, successResponse, isValidObjectId } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/news/[id]/views - Incrementar visualizações de uma notícia
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID da notícia inválido')
    }

    const news = await News.findById(id)

    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    if (!news.published) {
      return errorResponse('Notícia não está publicada', 400)
    }

    // Incrementar visualizações
    await news.incrementViews()

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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID da notícia inválido')
    }

    const news = await News.findById(id).select('views published')

    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    if (!news.published) {
      return errorResponse('Notícia não está publicada', 400)
    }

    return NextResponse.json(
      successResponse({ views: news.views || 0 })
    )
  } catch (error) {
    console.error('Erro ao buscar visualizações:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}