import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MemberContent from '@/models/MemberContent'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils'
import { isValidObjectId } from '@/lib/utils'

interface RouteParams {
  params: { id: string }
}

// GET /api/admin/member-content/[id] - Buscar conteúdo específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return errorResponse('ID inválido')
    }

    const content = await MemberContent.findById(id)
      .populate('author', 'name email')
      .lean()

    if (!content) {
      return errorResponse('Conteúdo não encontrado', 404)
    }

    return NextResponse.json(successResponse(content))
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// PATCH /api/admin/member-content/[id] - Atualizar conteúdo
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return errorResponse('ID inválido')
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Buscar conteúdo existente
    const existingContent = await MemberContent.findById(id)
    if (!existingContent) {
      return errorResponse('Conteúdo não encontrado', 404)
    }

    // Atualizar campos permitidos
    const allowedFields = [
      'title', 'description', 'type', 'category', 'url', 'thumbnail',
      'content', 'fileUrl', 'videoUrl', 'eventDate', 'eventLocation',
      'isFeatured', 'isActive', 'tags'
    ]

    allowedFields.forEach(field => {
      if (sanitizedData[field] !== undefined) {
        existingContent[field] = sanitizedData[field]
      }
    })

    await existingContent.save()
    
    // Populate author para retorno
    await existingContent.populate('author', 'name email')
    
    return NextResponse.json(successResponse(existingContent, 'Conteúdo atualizado com sucesso'))
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/admin/member-content/[id] - Excluir conteúdo
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return errorResponse('ID inválido')
    }

    const content = await MemberContent.findById(id)
    if (!content) {
      return errorResponse('Conteúdo não encontrado', 404)
    }

    await MemberContent.findByIdAndDelete(id)
    
    return NextResponse.json(successResponse({}, 'Conteúdo excluído com sucesso'))
  } catch (error) {
    console.error('Erro ao excluir conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}