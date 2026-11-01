export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, successResponse, validateSession } from '@/lib/api-utils'
import { loadAdminBilling } from '@/lib/subscription-service'

export async function GET(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    const data = await loadAdminBilling()
    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error('Erro ao carregar a facturação:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
