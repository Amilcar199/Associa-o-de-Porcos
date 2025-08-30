export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'

// POST /api/auth/verify-email { email, code }
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { email, code } = sanitizeInput(body)
    if (!email || !code) return errorResponse('Email e código são obrigatórios')

    const user = await User.findOne({ email })
    if (!user) return errorResponse('Usuário não encontrado', 404)

    if (user.emailVerified) return NextResponse.json(successResponse({ verified: true }))

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      return errorResponse('Nenhum código pendente')
    }
    if (String(user.emailVerificationCode) !== String(code)) {
      return errorResponse('Código inválido')
    }
    if (new Date(user.emailVerificationExpires).getTime() < Date.now()) {
      return errorResponse('Código expirado')
    }

    user.emailVerified = true
    user.emailVerificationCode = null
    user.emailVerificationExpires = null
    await user.save()

    return NextResponse.json(successResponse({ verified: true }, 'Email verificado com sucesso'))
  } catch (e) {
    console.error('Erro ao verificar email:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

