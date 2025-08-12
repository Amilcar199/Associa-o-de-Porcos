import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MemberContent from '@/models/MemberContent'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

// GET /api/admin/member-content - Listar conteúdo de membros (apenas admins)
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
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
    const [content, total] = await Promise.all([
      MemberContent.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MemberContent.countDocuments(query)
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
    await connectDB()
    
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

    // Criar novo conteúdo
    const newContent = new MemberContent({
      ...sanitizedData,
      author: session.user.id,
      isActive: true,
      isFeatured: false,
      views: 0,
      downloads: 0
    })

    await newContent.save()
    
    // Populate author para retorno
    await newContent.populate('author', 'name email')
    
    return NextResponse.json(successResponse(newContent, 'Conteúdo criado com sucesso'), { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}