export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import NewsletterSubscriber from '@/models/NewsletterSubscriber'
import { validateSession, errorResponse, successResponse } from '@/lib/api-utils'
import { collectNewsletterEmails } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    await connectDB()
    const [rows, totalReach] = await Promise.all([
      NewsletterSubscriber.find({}).sort({ createdAt: -1 }).limit(200).lean(),
      collectNewsletterEmails(),
    ])

    return NextResponse.json(successResponse({
      subscribers: rows,
      activeCount: rows.filter((r) => r.active).length,
      totalReach: totalReach.length,
    }))
  } catch (error) {
    console.error('Erro ao listar assinantes:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
