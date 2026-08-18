export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import connectDB from '@/lib/mongodb'
import NewsletterSubscriber from '@/models/NewsletterSubscriber'
import { isValidEmail } from '@/lib/api-utils'
import { BRAND_NAME } from '@/lib/brand'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }

    const normalized = email.toLowerCase().trim()
    await connectDB()

    const existing = await NewsletterSubscriber.findOne({ email: normalized })
    if (existing?.active) {
      return NextResponse.json({ success: true, message: 'Já está inscrito' })
    }

    await NewsletterSubscriber.findOneAndUpdate(
      { email: normalized },
      { email: normalized, active: true, unsubscribedAt: null, source: 'footer' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@associacaoporcos.ao'
    await sendEmail({
      to: adminEmail,
      subject: `Nova inscrição na newsletter — ${BRAND_NAME}`,
      html: `<p>Novo assinante da newsletter.</p><p><strong>Email:</strong> ${normalized}</p>`,
      text: `Novo assinante da newsletter: ${normalized}`,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erro na inscrição da newsletter:', e)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
