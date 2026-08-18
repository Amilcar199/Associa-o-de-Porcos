export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { validateSession, errorResponse, successResponse } from '@/lib/api-utils'
import { collectNewsletterEmails } from '@/lib/notifications'
import { sendEmail, getNewsletterTemplate } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const body = await req.json()
    const title = String(body.title || '').trim()
    const content = String(body.content || '').trim()
    if (!title || !content) {
      return errorResponse('Título e conteúdo são obrigatórios')
    }

    await connectDB()
    const emails = await collectNewsletterEmails()
    if (emails.length === 0) {
      return errorResponse('Não há destinatários inscritos', 400)
    }

    const base = process.env.NEXTAUTH_URL || 'https://assuino.com'
    let sent = 0
    let failed = 0

    for (const email of emails) {
      const unsubscribeUrl = `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
      const template = getNewsletterTemplate(title, content, unsubscribeUrl)
      const ok = await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
      if (ok) sent += 1
      else failed += 1
    }

    return NextResponse.json(successResponse({ sent, failed, total: emails.length }, 'Newsletter enviada'))
  } catch (error) {
    console.error('Erro ao enviar newsletter:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
