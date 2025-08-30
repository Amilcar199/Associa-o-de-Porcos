export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'
import { getVerificationCodeTemplate, sendEmail } from '@/lib/email'

// POST /api/auth/resend-code { email }
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { email } = sanitizeInput(body)
    if (!email) return errorResponse('Email é obrigatório')

    const user = await User.findOne({ email })
    if (!user) return errorResponse('Usuário não encontrado', 404)
    if (user.emailVerified) return NextResponse.json(successResponse({ sent: false }, 'Email já verificado'))

    const code = (Math.floor(100000 + Math.random() * 900000)).toString()
    user.emailVerificationCode = code
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    try {
      const tpl = getVerificationCodeTemplate(user.name, code)
      await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text })
    } catch (e) {
      console.error('Erro ao enviar código:', e)
    }

    return NextResponse.json(successResponse({ sent: true }, 'Código reenviado'))
  } catch (e) {
    console.error('Erro ao reenviar código:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

