export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateSession, errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/news/[id] - Buscar notícia específica
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const news = await prisma.news.findUnique({ where: { id } })

    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    // Incrementar visualizações se for uma requisição pública
    if (!req.headers.get('authorization')) {
      await prisma.news.update({ where: { id }, data: { views: { increment: 1 } } })
    }

    return NextResponse.json(successResponse(news))
  } catch (error) {
    console.error('Erro ao buscar notícia:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// PUT /api/news/[id] - Atualizar notícia (apenas admins)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    // Buscar notícia existente
    const existing = await prisma.news.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Notícia não encontrada', 404)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validar dados obrigatórios
    if (!sanitizedData.title || !sanitizedData.content) {
      return errorResponse('Título e conteúdo são obrigatórios')
    }

    // Normalizar mídias
    if (!sanitizedData.images && sanitizedData.featuredImage) {
      sanitizedData.images = [sanitizedData.featuredImage]
    }
    if (sanitizedData.videos && !Array.isArray(sanitizedData.videos)) {
      sanitizedData.videos = []
    }
    const images = Array.isArray(sanitizedData.images) ? sanitizedData.images : undefined
    const videos = Array.isArray(sanitizedData.videos) ? sanitizedData.videos : undefined
    const tags = Array.isArray(sanitizedData.tags) ? sanitizedData.tags : undefined

    const news = await prisma.news.update({
      where: { id },
      data: {
        title: sanitizedData.title,
        slug: sanitizedData.slug,
        content: sanitizedData.content,
        excerpt: sanitizedData.excerpt,
        featuredImage: sanitizedData.featuredImage,
        images: images as any,
        videos: videos as any,
        category: sanitizedData.category,
        tags: tags as any,
        published: typeof sanitizedData.published === 'boolean' ? sanitizedData.published : existing.published,
        featured: typeof sanitizedData.featured === 'boolean' ? sanitizedData.featured : existing.featured,
        publishedAt: sanitizedData.published ? (sanitizedData.publishedAt ? new Date(sanitizedData.publishedAt) : new Date()) : existing.publishedAt
      }
    })

    return NextResponse.json(
      successResponse(news, 'Notícia atualizada com sucesso')
    )
  } catch (error: any) {
    console.error('Erro ao atualizar notícia:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/news/[id] - Deletar notícia (apenas admins)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }
    const news = await prisma.news.findUnique({ where: { id } })
    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }
    await prisma.news.delete({ where: { id } })

    return NextResponse.json(
      successResponse(null, 'Notícia deletada com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar notícia:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
