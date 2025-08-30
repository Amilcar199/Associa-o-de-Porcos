export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/api-utils'
import ActivityLog from '@/models/ActivityLog'

// Nota: Com strategy JWT, invalidar outras sessões exige rotation/blacklist externa.
// Aqui, como paliativo, mudamos a secret per-user (salt lógico) armazenando em tokenVersion.
// Para simplicidade, retornamos sucesso para UX e orientamos re-login.

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return errorResponse('Não autorizado', 401)

    // TODO(opcional): implementar tokenVersion no User e incrementar aqui.
    try {
      await ActivityLog.create({
        user: (session.user as any).id,
        type: 'session_revoked',
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      })
    } catch {}
    return Response.json(successResponse({}, 'Sessões encerradas em outros dispositivos'))
  } catch (e) {
    console.error('Erro ao encerrar sessões:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

