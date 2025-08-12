export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/news/[id] - Buscar notícia específica
export async function GET(req: NextRequest, { params }: RouteParams) {
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

    // Incrementar visualizações se for uma requisição pública
    if (!req.headers.get('authorization')) {
      await news.incrementViews()
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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID da notícia inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    // Buscar notícia existente
    const news = await News.findById(id)
    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validar dados obrigatórios
    if (!sanitizedData.title || !sanitizedData.content) {
      return errorResponse('Título e conteúdo são obrigatórios')
    }

    // Atualizar notícia
    Object.assign(news, sanitizedData)
    await news.save()

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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID da notícia inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const news = await News.findById(id)
    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    // Deletar notícia permanentemente
    await News.findByIdAndDelete(id)

    return NextResponse.json(
      successResponse(null, 'Notícia deletada com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar notícia:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
