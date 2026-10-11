export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)

    await connectDB()
    const user = await User.findById(userId).select('verificationStatus')
    if (!user) return errorResponse('Usuário não encontrado', 404)
    if (user.verificationStatus === 'verified') {
      return NextResponse.json(successResponse({ verificationStatus: 'verified' }, 'A conta já está verificada'))
    }
    user.verificationStatus = 'pending'
    await user.save()
    return NextResponse.json(successResponse({ verificationStatus: 'pending' }, 'Pedido de verificação enviado'))
  } catch (error) {
    console.error('Erro ao pedir verificação:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
