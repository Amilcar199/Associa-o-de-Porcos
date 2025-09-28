export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sanitizeInput } from '@/lib/api-utils'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { token, answers } = sanitizeInput(body)
    if (!token || !answers) {
      return NextResponse.json({ message: 'Token e respostas são obrigatórios' }, { status: 400 })
    }

    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } })
    if (!user) {
      return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 400 })
    }

    let score = 0
    const phone = (user.phone || '').toString()
    const company = (user.company || '').toString().trim().toLowerCase()

    if (answers.phone_last2) {
      const digits = phone.replace(/\D/g, '')
      if (digits && answers.phone_last2 === digits.slice(-2)) score++
    }
    if (answers.company_exact) {
      if (company && company === answers.company_exact.toString().trim().toLowerCase()) score++
    }

    if (score === 0) {
      return NextResponse.json({ ok: false, message: 'Respostas incorretas' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

