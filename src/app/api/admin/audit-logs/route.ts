export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import AuditLog from '@/models/AuditLog'
import { errorResponse, successResponse, validateSession } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    await connectDB()
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30', 10) || 30))
    const [rows, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'name email')
        .lean(),
      AuditLog.countDocuments(),
    ])

    return NextResponse.json(successResponse({
      rows,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    }))
  } catch (error) {
    console.error('Erro ao listar registos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
