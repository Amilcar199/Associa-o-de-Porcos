export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import {
  getPaginationParams,
  getSearchFilters,
  buildMongoQuery,
  paginateResults,
  successResponse,
  errorResponse,
  paginatedResponse,
  sanitizeInput,
  validateSession,
  generateSlug
} from '@/lib/api-utils'

// GET /api/news - Listar notícias com paginação e filtros
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Filtros específicos para notícias
    const newsFilters: any = {}
    
    if (searchParams.get('author')) {
      newsFilters.author = searchParams.get('author')
    }
    if (searchParams.get('slug')) {
      newsFilters.slug = searchParams.get('slug')
    }

    // Filtros de data
    if (searchParams.get('dateFrom')) {
      const dateFrom = new Date(searchParams.get('dateFrom')!)
      newsFilters.publishedAt = { ...newsFilters.publishedAt, $gte: dateFrom }
    }
    if (searchParams.get('dateTo')) {
      const dateTo = new Date(searchParams.get('dateTo')!)
      newsFilters.publishedAt = { ...newsFilters.publishedAt, $lte: dateTo }
    }

    // Construir query final
    const baseQuery = buildMongoQuery(filters)
    const finalQuery = { 
      ...baseQuery, 
      ...newsFilters,
      published: true // Apenas notícias publicadas para o público
    }

    // Se for busca por slug específico, retornar apenas um resultado
    if (newsFilters.slug) {
      const news = await News.findOne(finalQuery).populate('author', 'name avatar')
      
      if (!news) {
        return errorResponse('Notícia não encontrada', 404)
      }

      // Incrementar visualizações
      await News.findByIdAndUpdate(news._id, { $inc: { views: 1 } })

      return NextResponse.json(successResponse(news))
    }

    // Executar consulta com paginação
    const result = await paginateResults(
      News,
      finalQuery,
      pagination,
      'author'
    )

    return NextResponse.json(paginatedResponse(result.data, result.pagination))
  } catch (error) {
    console.error('Erro ao buscar notícias:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/news - Criar nova notícia (apenas admins)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Validar sessão (apenas admins podem criar notícias)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Definir o autor como o usuário logado
    sanitizedData.author = authResult.user.id

    // Gerar slug se não fornecido
    if (!sanitizedData.slug && sanitizedData.title) {
      sanitizedData.slug = generateSlug(sanitizedData.title)
      
      // Verificar se slug já existe
      const existingNews = await News.findOne({ slug: sanitizedData.slug })
      if (existingNews) {
        sanitizedData.slug = `${sanitizedData.slug}-${Date.now()}`
      }
    }

    // Definir data de publicação se publicado
    if (sanitizedData.published && !sanitizedData.publishedAt) {
      sanitizedData.publishedAt = new Date()
    }

    // Criar notícia
    if (!sanitizedData.images && sanitizedData.featuredImage) {
      sanitizedData.images = [sanitizedData.featuredImage]
    }
    if (!Array.isArray(sanitizedData.videos)) {
      sanitizedData.videos = []
    }
    const news = new News(sanitizedData)
    await news.save()

    // Buscar notícia com dados do autor
    const populatedNews = await News.findById(news._id).populate('author', 'name avatar')

    return NextResponse.json(
      successResponse(populatedNews, 'Notícia criada com sucesso'),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar notícia:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }

    if (error.code === 11000 && error.keyPattern?.slug) {
      return errorResponse('Já existe uma notícia com este slug')
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}
