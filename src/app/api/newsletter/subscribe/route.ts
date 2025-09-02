export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@associacaoporcos.ao'
    const subject = 'Novo pedido de assinatura de novidades'
    const message = `Eu quero ficar por dentro das novidades.\nEmail: ${email}`

    const ok = await sendEmail({
      to: adminEmail,
      subject,
      html: `<p>Eu quero ficar por dentro das novidades.</p><p><strong>Email:</strong> ${email}</p>`,
      text: `${subject}\n${message}`
    })

    if (!ok) {
      // Fallback: registrar como contato no banco (quando possível)
      try {
        await connectDB()
        const contact = new Contact({
          name: 'Assinante Newsletter',
          email,
          subject: 'Assinatura de Novidades',
          message: 'Eu quero ficar por dentro das novidades.'
        })
        await contact.save()
      } catch (e) {
        console.error('Falha no fallback de contato:', e)
        // Mesmo assim, não bloquear a experiência do usuário
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

