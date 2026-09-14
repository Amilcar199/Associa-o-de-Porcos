export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import News from '@/models/News'
import Contact from '@/models/Contact'
import MemberContent from '@/models/MemberContent'
import Farm from '@/models/Farm'
import { errorResponse, validateSession } from '@/lib/api-utils'

// Quantos registos buscamos de cada coleção para montar o feed combinado.
// Isto limita o feed a um universo razoável (não é "infinito"): no máximo
// ~300 eventos recentes no total, ordenados e paginados abaixo.
const PER_COLLECTION_LIMIT = 60

interface FeedItem {
  type: 'user' | 'product' | 'news' | 'contact' | 'member-content' | 'farm'
  action: string
  date: Date
  user?: string
  details: string
}

// GET /api/admin/activity?page=1&limit=10 - Feed de atividade recente (admin), com paginação real
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    const [recentUsers, recentProducts, recentNews, recentContacts, recentMemberContent, recentFarms] = await Promise.all([
      User.find({ isActive: true })
        .sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT)
        .select('name email createdAt').lean().catch(() => []),
      Product.find({ isActive: true })
        .sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT)
        .select('name breed seller createdAt').populate('seller', 'name').lean().catch(() => []),
      News.find()
        .sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT)
        .select('title published author createdAt').populate('author', 'name').lean().catch(() => []),
      Contact.find()
        .sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT)
        .select('name email subject status createdAt').lean().catch(() => []),
      MemberContent.find({ isActive: true })
        .sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT)
        .select('title type category createdAt').lean().catch(() => []),
      Farm.find()
        .sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT)
        .select('producerName province status createdAt').lean().catch(() => []),
    ])

    const feed: FeedItem[] = [
      ...(recentUsers || []).map((u: any) => ({
        type: 'user' as const, action: 'Novo usuário cadastrado', date: u.createdAt, user: u.name, details: u.email,
      })),
      ...(recentProducts || []).map((p: any) => ({
        type: 'product' as const, action: 'Novo produto cadastrado', date: p.createdAt, user: p.seller?.name, details: `${p.name} (${p.breed})`,
      })),
      ...(recentNews || []).map((n: any) => ({
        type: 'news' as const, action: n.published ? 'Notícia publicada' : 'Rascunho criado', date: n.createdAt, user: n.author?.name, details: n.title,
      })),
      ...(recentContacts || []).map((c: any) => ({
        type: 'contact' as const, action: 'Nova mensagem de contato', date: c.createdAt, user: c.name, details: c.subject,
      })),
      ...(recentMemberContent || []).map((m: any) => ({
        type: 'member-content' as const, action: 'Novo conteúdo de membros criado', date: m.createdAt, user: 'Admin', details: `${m.title} (${m.type})`,
      })),
      ...(recentFarms || []).map((f: any) => ({
        type: 'farm' as const,
        action: f.status === 'approved' ? 'Fazenda aprovada no mapa' : 'Novo cadastro de fazenda',
        date: f.createdAt,
        user: f.producerName,
        details: f.province,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const total = feed.length
    const pages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const data = feed.slice(start, start + limit)

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    })
  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
