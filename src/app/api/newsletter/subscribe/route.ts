export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

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
      return NextResponse.json({ success: false, error: 'Falha ao enviar notificação' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

