export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'
import { validateSession, errorResponse, getPaginationParams, paginateResults } from '@/lib/api-utils'

// GET /api/admin/farms - Listar todos os cadastros (admin), com filtro opcional por status
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const status = searchParams.get('status')
    const province = searchParams.get('province')

    const query: any = {}
    if (status && ['pending', 'approved', 'rejected'].includes(status)) query.status = status
    if (province) query.province = province

    const result = await paginateResults(Farm, query, {
      ...pagination,
      sort: pagination.sort || 'createdAt',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao listar fazendas (admin):', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
