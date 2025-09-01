export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ActivityLog from '@/models/ActivityLog'
import { validateSession, errorResponse, successResponse, getPaginationParams } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { searchParams } = new URL(req.url)
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = getPaginationParams(searchParams)

    const skip = (page - 1) * limit

    const query: any = { type: 'membership_request' }

    const [results, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email company bio')
        .lean(),
      ActivityLog.countDocuments(query)
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json(successResponse({ results, pagination: { page, limit, total, pages } }))
  } catch (e) {
    console.error('Erro ao listar solicitações:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

