import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import News from '@/models/News'
import Contact from '@/models/Contact'
import Collaborator from '@/models/Collaborator'
import MemberContent from '@/models/MemberContent'
import {
  successResponse,
  errorResponse,
  validateSession
} from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Buscar estatísticas do dashboard (apenas admins)
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))

    // Buscar estatísticas básicas
    const [
      totalUsers,
      totalProducts,
      totalNews,
      totalContacts,
      totalCollaborators,
      activeProducts,
      publishedNews,
      newContactsThisMonth,
      usersThisMonth,
      productsThisMonth,
      newsThisMonth,
      totalMemberContent,
      activeMemberContent
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      News.countDocuments(),
      Contact.countDocuments(),
      Collaborator.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, availability: 'available' }),
      News.countDocuments({ published: true }),
      Contact.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
      Product.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
      News.countDocuments({ createdAt: { $gte: startOfMonth } }),
      MemberContent.countDocuments().catch(() => 0),
      MemberContent.countDocuments({ isActive: true }).catch(() => 0)
    ])

    // Buscar estatísticas de contatos por status
    const contactStats = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Buscar atividade recente
    const [recentUsers, recentProducts, recentNews, recentContacts, recentMemberContent] = await Promise.all([
      User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt')
        .lean()
        .catch(() => []),
      
      Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name breed seller createdAt')
        .populate('seller', 'name')
        .lean()
        .catch(() => []),
      
      News.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title published author createdAt')
        .populate('author', 'name')
        .lean()
        .catch(() => []),
      
      Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject status createdAt')
        .lean()
        .catch(() => []),
      
      MemberContent.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type category createdAt')
        .lean()
        .catch(() => [])
    ])

    // Combinar atividade recente
    const recentActivity = [
      ...(recentUsers || []).map(user => ({
        type: 'user' as const,
        action: 'Novo usuário cadastrado',
        date: user.createdAt,
        user: user.name,
        details: user.email
      })),
      ...(recentProducts || []).map(product => ({
        type: 'product' as const,
        action: 'Novo produto cadastrado',
        date: product.createdAt,
        user: (product.seller as any)?.name,
        details: `${product.name} (${product.breed})`
      })),
      ...(recentNews || []).map(news => ({
        type: 'news' as const,
        action: news.published ? 'Notícia publicada' : 'Rascunho criado',
        date: news.createdAt,
        user: (news.author as any)?.name,
        details: news.title
      })),
      ...(recentContacts || []).map(contact => ({
        type: 'contact' as const,
        action: 'Nova mensagem de contato',
        date: contact.createdAt,
        user: contact.name,
        details: contact.subject
      })),
      ...(recentMemberContent || []).map(content => ({
        type: 'member-content' as const,
        action: 'Novo conteúdo de membros criado',
        date: content.createdAt,
        user: 'Admin',
        details: `${content.title} (${content.type})`
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

    // Estatísticas por categoria de produtos
    const productsByBreed = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$breed', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).catch(() => [])

    // Estatísticas por categoria de notícias
    const newsByCategory = await News.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).catch(() => [])

    // Views das notícias mais populares
    const topNews = await News.find({ published: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views publishedAt')
      .lean()
      .catch(() => [])

    const stats = {
      overview: {
        totalUsers,
        totalProducts,
        totalNews,
        totalContacts,
        totalCollaborators,
        activeProducts,
        publishedNews,
        newContactsThisMonth,
        usersThisMonth,
        productsThisMonth,
        newsThisMonth,
        totalMemberContent,
        activeMemberContent
      },
      contacts: contactStats,
      charts: {
        productsByBreed: productsByBreed.map(item => ({
          name: item._id,
          value: item.count
        })),
        newsByCategory: newsByCategory.map(item => ({
          name: item._id === 'news' ? 'Notícias' : 
                item._id === 'events' ? 'Eventos' :
                item._id === 'tips' ? 'Dicas' :
                item._id === 'market' ? 'Mercado' : item._id,
          value: item.count
        })),
        topNews: topNews.map(news => ({
          title: news.title,
          views: news.views,
          publishedAt: news.publishedAt
        }))
      },
      recentActivity
    }

    return NextResponse.json(successResponse(stats))
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
