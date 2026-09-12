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

const PER_COLLECTION_LIMIT = 60

interface FeedItem {
  type: 'user' | 'product' | 'news' | 'contact' | 'member-content' | 'farm'
  action: string
  date: Date
  user?: string
  details: string
}

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
      User.find({ isActive: true }).sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT).select('name email createdAt').lean().catch(() => []),
      Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT).select('name breed seller createdAt').populate('seller', 'name').lean().catch(() => []),
      News.find().sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT).select('title published author createdAt').populate('author', 'name').lean().catch(() => []),
      Contact.find().sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT).select('name email subject status createdAt').lean().catch(() => []),
      MemberContent.find({ isActive: true }).sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT).select('title type category createdAt').lean().catch(() => []),
      Farm.find().sort({ createdAt: -1 }).limit(PER_COLLECTION_LIMIT).select('producerName province status createdAt').lean().catch(() => []),
    ])

    const feed: FeedItem[] = [
      ...(recentUsers as any[]).map((item) => ({ type: 'user' as const, action: 'Novo usuário cadastrado', date: item.createdAt, user: item.name, details: item.email })),
      ...(recentProducts as any[]).map((item) => ({ type: 'product' as const, action: 'Novo produto cadastrado', date: item.createdAt, user: item.seller?.name, details: `${item.name} (${item.breed})` })),
      ...(recentNews as any[]).map((item) => ({ type: 'news' as const, action: item.published ? 'Notícia publicada' : 'Rascunho criado', date: item.createdAt, user: item.author?.name, details: item.title })),
      ...(recentContacts as any[]).map((item) => ({ type: 'contact' as const, action: 'Nova mensagem de contato', date: item.createdAt, user: item.name, details: item.subject })),
      ...(recentMemberContent as any[]).map((item) => ({ type: 'member-content' as const, action: 'Novo conteúdo de membros criado', date: item.createdAt, user: 'Admin', details: `${item.title} (${item.type})` })),
      ...(recentFarms as any[]).map((item) => ({ type: 'farm' as const, action: item.status === 'approved' ? 'Fazenda aprovada no mapa' : 'Novo cadastro de fazenda', date: item.createdAt, user: item.producerName, details: item.province })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const total = feed.length
    const pages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return NextResponse.json({
      success: true,
      data: feed.slice(start, start + limit),
      pagination: { page, limit, total, pages, hasMore: page < pages },
    })
  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
