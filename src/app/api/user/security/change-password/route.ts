export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'
import { isPasswordStrong } from '@/lib/password'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return errorResponse('Não autorizado', 401)

    const { currentPassword, newPassword } = sanitizeInput(await req.json())
    if (!currentPassword || !newPassword) {
      return errorResponse('Senha inválida.')
    }
    if (!isPasswordStrong(String(newPassword))) {
      return errorResponse('Senha fraca: mínimo 6 caracteres, ao menos um número e sem sequências numéricas (ex.: 123, 321)')
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return errorResponse('Usuário não encontrado', 404)

    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return errorResponse('Senha atual incorreta', 400)

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } })

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          type: 'password_change',
          ip: req.headers.get('x-forwarded-for') || undefined || null,
          userAgent: req.headers.get('user-agent') || undefined || null,
        }
      })
    } catch {}

    return Response.json(successResponse({}, 'Senha alterada com sucesso'))
  } catch (e) {
    console.error('Erro ao alterar senha:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

