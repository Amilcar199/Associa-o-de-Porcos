export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import InAppNotification from '@/models/InAppNotification'
import { errorResponse, successResponse } from '@/lib/api-utils'

async function userId() {
  const session = await getServerSession(authOptions)
  const id = (session as any)?.user?.id
  if (!session?.user || !id) return null
  return String(id)
}

export async function GET() {
  try {
    const id = await userId()
    if (!id) return errorResponse('Não autorizado', 401)
    await connectDB()
    const items = await InAppNotification.find({ user: id }).sort({ createdAt: -1 }).limit(30).lean()
    return NextResponse.json(successResponse(items))
  } catch (error) {
    console.error('Erro ao listar notificações:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = await userId()
    if (!id) return errorResponse('Não autorizado', 401)
    const body = await req.json().catch(() => ({}))
    await connectDB()
    if (body.all === true) {
      await InAppNotification.updateMany({ user: id, read: false }, { read: true })
    } else if (typeof body.id === 'string' && /^[a-f\d]{24}$/i.test(body.id)) {
      await InAppNotification.updateOne({ _id: body.id, user: id }, { read: true })
    }
    return NextResponse.json(successResponse({}, 'Notificações actualizadas'))
  } catch (error) {
    console.error('Erro ao actualizar notificações:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
