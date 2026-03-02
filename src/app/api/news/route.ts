export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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
    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    // Filtros
    const where: any = { published: true }
    const search = searchParams.get('search') || undefined
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }
    const authorId = searchParams.get('author') || undefined
    if (authorId) where.authorId = authorId
    const slug = searchParams.get('slug') || undefined
    if (slug) where.slug = slug
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    if (dateFrom || dateTo) {
      where.publishedAt = {}
      if (dateFrom) (where.publishedAt as any).gte = new Date(dateFrom)
      if (dateTo) (where.publishedAt as any).lte = new Date(dateTo)
    }

    if (slug) {
      const news = await prisma.news.findFirst({ where })
      if (!news) return errorResponse('Notícia não encontrada', 404)
      await prisma.news.update({ where: { id: news.id }, data: { views: { increment: 1 } } })
      return NextResponse.json(successResponse(news as any))
    }

    const total = await prisma.news.count({ where })
    const data = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (pagination.page! - 1) * pagination.limit!,
      take: pagination.limit!
    })

    return NextResponse.json(paginatedResponse(data as any, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit!)
    }))
  } catch (error) {
    console.error('Erro ao buscar notícias:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/news - Criar nova notícia (apenas admins)
export async function POST(req: NextRequest) {
  try {
    // Validar sessão (apenas admins podem criar notícias)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Definir o autor como o usuário logado
    const authorId = authResult.user.id

    // Gerar slug se não fornecido
    if (!sanitizedData.slug && sanitizedData.title) {
      sanitizedData.slug = generateSlug(sanitizedData.title)
      const existing = await prisma.news.findUnique({ where: { slug: sanitizedData.slug } })
      if (existing) sanitizedData.slug = `${sanitizedData.slug}-${Date.now()}`
    }

    // Definir data de publicação se publicado
    if (sanitizedData.published && !sanitizedData.publishedAt) {
      sanitizedData.publishedAt = new Date()
    }

    const images = Array.isArray(sanitizedData.images) && sanitizedData.images.length
      ? sanitizedData.images
      : (sanitizedData.featuredImage ? [sanitizedData.featuredImage] : [])
    const videos = Array.isArray(sanitizedData.videos) ? sanitizedData.videos : []
    const tags = Array.isArray(sanitizedData.tags) ? sanitizedData.tags : []

    const created = await prisma.news.create({
      data: {
        title: sanitizedData.title,
        slug: sanitizedData.slug,
        content: sanitizedData.content,
        excerpt: sanitizedData.excerpt,
        featuredImage: sanitizedData.featuredImage,
        images: images as any,
        videos: videos as any,
        authorId,
        category: sanitizedData.category,
        tags: tags as any,
        published: !!sanitizedData.published,
        featured: !!sanitizedData.featured,
        publishedAt: sanitizedData.published ? (sanitizedData.publishedAt ? new Date(sanitizedData.publishedAt) : new Date()) : null
      }
    })

    return NextResponse.json(successResponse(created, 'Notícia criada com sucesso'), { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar notícia:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }

    if ((error as any).code === 'P2002') {
      return errorResponse('Já existe uma notícia com este slug')
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}
