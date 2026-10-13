export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { errorResponse, successResponse } from '@/lib/api-utils'
import { hasProPlan } from '@/lib/notify-users'
import { expireDuePayments } from '@/lib/settle-payment'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)
    await connectDB()
    await expireDuePayments()
    const user = await User.findById(userId).select('plan planExpiresAt verificationStatus role').lean() as {
      plan?: string
      planExpiresAt?: Date | null
      verificationStatus?: string
      role?: string
    } | null
    if (!user) return errorResponse('Usuário não encontrado', 404)
    return NextResponse.json(successResponse({
      plan: user.plan || 'free',
      planExpiresAt: user.planExpiresAt || null,
      verificationStatus: user.verificationStatus || 'none',
      pro: hasProPlan(user),
      role: user.role,
    }))
  } catch (error) {
    console.error('Erro ao ler o plano:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
