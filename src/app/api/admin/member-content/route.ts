import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

// GET /api/admin/member-content - Listar conteúdo de membros (apenas admins)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    // Construir query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (type) query.type = type
    if (category) query.category = category
    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false

    // Calcular paginação
    const skip = (page - 1) * limit
    
    // Executar queries
    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (type) where.type = type
    if (category) where.category = category
    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false

    const [content, total] = await Promise.all([
      prisma.memberContent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, title: true, type: true, category: true, createdAt: true, author: { select: { name: true, email: true } } }
      }),
      prisma.memberContent.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(successResponse({
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }))
  } catch (error) {
    console.error('Erro ao buscar conteúdo de membros:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/admin/member-content - Criar novo conteúdo (apenas admins)
export async function POST(req: NextRequest) {
  try {
    
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validações básicas
    if (!sanitizedData.title || !sanitizedData.description || !sanitizedData.type || !sanitizedData.category) {
      return errorResponse('Título, descrição, tipo e categoria são obrigatórios')
    }

    const created = await prisma.memberContent.create({ data: {
      title: sanitizedData.title,
      description: sanitizedData.description,
      type: sanitizedData.type,
      category: sanitizedData.category,
      url: sanitizedData.url || null,
      thumbnail: sanitizedData.thumbnail || null,
      content: sanitizedData.content || null,
      fileUrl: sanitizedData.fileUrl || null,
      videoUrl: sanitizedData.videoUrl || null,
      eventDate: sanitizedData.eventDate ? new Date(sanitizedData.eventDate) : null,
      eventLocation: sanitizedData.eventLocation || null,
      isFeatured: false,
      isActive: true,
      authorId: session.user.id,
      tags: Array.isArray(sanitizedData.tags) ? sanitizedData.tags as any : [] as any,
      views: 0,
      downloads: 0
    }})
    return NextResponse.json(successResponse(created, 'Conteúdo criado com sucesso'), { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}