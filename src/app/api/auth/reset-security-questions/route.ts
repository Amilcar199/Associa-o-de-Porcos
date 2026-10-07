export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { hashResetToken } from '@/lib/password'
import { rateLimitOrNull } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'reset-security-questions', limit: 20, windowMs: 15 * 60 * 1000 })
  if (limited) return limited

  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || ''
    if (!token) {
      return NextResponse.json({ message: 'Token é obrigatório' }, { status: 400 })
    }

    const user = await User.findOne({ passwordResetToken: hashResetToken(token), passwordResetExpires: { $gt: new Date() } })
    if (!user) {
      return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 400 })
    }

    const questions: Array<{ id: string; label: string }> = []
    if (user.phone && typeof user.phone === 'string' && user.phone.replace(/\D/g, '').length >= 2) {
      questions.push({ id: 'phone_last2', label: 'Quais são os últimos 2 dígitos do seu telefone cadastrado?' })
    }
    if (user.company && typeof user.company === 'string' && user.company.trim().length >= 2) {
      questions.push({ id: 'company_exact', label: 'Qual o nome da sua empresa cadastrada?' })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

