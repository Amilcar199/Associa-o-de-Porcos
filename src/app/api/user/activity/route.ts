export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ActivityLog from '@/models/ActivityLog'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return errorResponse('Não autorizado', 401)

    await connectDB()
    const logs = await ActivityLog.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json(successResponse(logs))
  } catch (e) {
    console.error('Erro ao buscar atividades:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

