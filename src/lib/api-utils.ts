import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import connectDB from './mongodb'
import { ApiResponse, PaginatedResponse } from '@/types'

// Interface para parâmetros de paginação
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// Interface para filtros de busca
export interface SearchFilters {
  search?: string
  category?: string
  status?: string
  featured?: boolean
  published?: boolean
  [key: string]: any
}

// Função para validar sessão
export async function validateSession(req: NextRequest, requireAdmin = false) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return { error: 'Não autorizado', status: 401 }
  }

  if (requireAdmin && session.user.role !== 'admin') {
    return { error: 'Acesso negado. Apenas administradores.', status: 403 }
  }

  return { session, user: session.user }
}

// Função para conectar ao DB e validar sessão
export async function withAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  requireAdmin = false
) {
  return async (req: NextRequest, context: any) => {
    try {
      // Conectar ao banco
      await connectDB()

      // Validar sessão
      const authResult = await validateSession(req, requireAdmin)
      if ('error' in authResult) {
        return NextResponse.json(
          { success: false, error: authResult.error },
          { status: authResult.status }
        )
      }

      // Adicionar user ao context
      context.user = authResult.user
      context.session = authResult.session

      return await handler(req, context)
    } catch (error) {
      console.error('Erro na API:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro interno do servidor' 
        },
        { status: 500 }
      )
    }
  }
}

// Função para extrair parâmetros de paginação
export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const sort = searchParams.get('sort') || 'createdAt'
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Máximo 100 itens por página
    sort,
    order
  }
}

// Função para extrair filtros de busca
export function getSearchFilters(searchParams: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {}

  // Filtros comuns
  if (searchParams.get('search')) {
    filters.search = searchParams.get('search')!
  }
  if (searchParams.get('category')) {
    filters.category = searchParams.get('category')!
  }
  if (searchParams.get('status')) {
    filters.status = searchParams.get('status')!
  }
  if (searchParams.get('featured')) {
    filters.featured = searchParams.get('featured') === 'true'
  }
  if (searchParams.get('published')) {
    filters.published = searchParams.get('published') === 'true'
  }

  return filters
}

// Função para construir query do MongoDB
export function buildMongoQuery(filters: SearchFilters) {
  const query: any = {}

  // Busca por texto
  if (filters.search) {
    query.$text = { $search: filters.search }
  }

  // Filtros específicos
  if (filters.category) {
    query.category = filters.category
  }
  if (filters.status) {
    query.status = filters.status
  }
  if (filters.featured !== undefined) {
    query.featured = filters.featured
  }
  if (filters.published !== undefined) {
    query.published = filters.published
  }

  return query
}

// Função para construir sort do MongoDB
export function buildMongoSort(sort: string, order: 'asc' | 'desc') {
  const sortObj: any = {}
  sortObj[sort] = order === 'asc' ? 1 : -1
  return sortObj
}

// Função para paginar resultados
export async function paginateResults<T>(
  model: any,
  query: any,
  pagination: PaginationParams,
  populate?: string | string[]
) {
  const { page = 1, limit = 10, sort, order } = pagination
  const skip = (page - 1) * limit

  // Construir query
  let mongoQuery = model.find(query)
  
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(field => {
        mongoQuery = mongoQuery.populate(field)
      })
    } else {
      mongoQuery = mongoQuery.populate(populate)
    }
  }

  // Aplicar sort e paginação
  const sortObj = buildMongoSort(sort!, order!)
  const results = await mongoQuery
    .sort(sortObj)
    .skip(skip)
    .limit(limit!)
    .lean()

  // Contar total
  const total = await model.countDocuments(query)
  const pages = Math.ceil(total / limit!)

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  }
}

// Função para resposta de sucesso
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

// Função para resposta de erro
export function errorResponse(error: string, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  )
}

// Função para resposta paginada
export function paginatedResponse<T>(
  data: T[],
  pagination: any,
  message?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    message
  }
}

// Função para validar ObjectId do MongoDB
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Função para sanitizar dados de entrada
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return data.trim()
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput)
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return data
}

// Função para gerar slug a partir de texto
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para formatar erros de validação do Mongoose
export function formatValidationErrors(error: any): string {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message)
    return errors.join(', ')
  }
  return error.message || 'Erro de validação'
}

// Função authMiddleware para compatibilidade com os arquivos de imagens
export async function authMiddleware(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return {
        success: false,
        error: 'Não autenticado'
      };
    }

    // Verificar se o usuário tem role de admin
    if (session.user?.role !== 'admin') {
      return {
        success: false,
        error: 'Acesso negado'
      };
    }

    return {
      success: true,
      user: session.user
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return {
      success: false,
      error: 'Erro na autenticação'
    };
  }
}
