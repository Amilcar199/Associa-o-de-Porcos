export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import ActivityLog from '@/models/ActivityLog'
import { errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return errorResponse('Não autorizado', 401)

    await connectDB()

    const { currentPassword, newPassword } = sanitizeInput(await req.json())
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return errorResponse('Senha inválida. Mínimo de 6 caracteres.')
    }

    const user = await User.findById(session.user.id).select('+password')
    if (!user) return errorResponse('Usuário não encontrado', 404)
    if (!user.emailVerified) return errorResponse('Email não verificado. Verifique seu email antes de alterar a senha.', 400)

    const ok = await user.comparePassword(currentPassword)
    if (!ok) return errorResponse('Senha atual incorreta', 400)

    user.password = newPassword
    await user.save()

    try {
      await ActivityLog.create({
        user: user._id,
        type: 'password_change',
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      })
    } catch {}

    return Response.json(successResponse({}, 'Senha alterada com sucesso'))
  } catch (e) {
    console.error('Erro ao alterar senha:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

