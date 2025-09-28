export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || ''
    if (!token) {
      return NextResponse.json({ message: 'Token é obrigatório' }, { status: 400 })
    }

    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } })
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

