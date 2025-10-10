export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/api-utils'
import prisma from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return errorResponse('Não autorizado', 401)
    await prisma.user.delete({ where: { id: session.user.id } })

    return Response.json(successResponse({}, 'Conta excluída com sucesso'))
  } catch (e) {
    console.error('Erro ao excluir conta:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

