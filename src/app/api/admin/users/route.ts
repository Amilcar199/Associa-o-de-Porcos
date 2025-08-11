export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getPaginationParams, successResponse, errorResponse, validateSession } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Apenas admins
    const auth = await validateSession(req, true)
    if ('error' in auth) {
      return errorResponse(auth.error || 'Não autorizado', auth.status)
    }

    const { searchParams } = new URL(req.url)
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = getPaginationParams(searchParams)

    const search = searchParams.get('search')?.trim()
    const role = searchParams.get('role') as 'admin' | 'member' | 'visitor' | null
    const activeParam = searchParams.get('active')
    const isActive = activeParam === null ? undefined : activeParam === 'true'

    const query: any = {}
    if (search) {
      const regex = new RegExp(search, 'i')
      query.$or = [{ name: regex }, { email: regex }]
    }
    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive

    const skip = (page - 1) * limit

    const [results, total] = await Promise.all([
      User.find(query)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .select('name email role isActive createdAt')
        .lean(),
      User.countDocuments(query)
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: results,
      pagination: { page, limit, total, pages }
    })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}