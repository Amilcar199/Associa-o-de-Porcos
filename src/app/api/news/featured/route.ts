import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import { successResponse, errorResponse } from '@/lib/api-utils'

// GET /api/news/featured - Buscar notícias em destaque
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '3')

    const news = await News.find({ 
      published: true, 
      featured: true 
    })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(Math.min(limit, 10)) // Máximo 10 notícias
    .lean()

    return NextResponse.json(successResponse(news))
  } catch (error) {
    console.error('Erro ao buscar notícias em destaque:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// GET /api/news/latest - Buscar últimas notícias
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '4')

    const news = await News.find({ 
      published: true 
    })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(Math.min(limit, 20)) // Máximo 20 notícias
    .lean()

    return NextResponse.json(successResponse(news))
  } catch (error) {
    console.error('Erro ao buscar últimas notícias:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
