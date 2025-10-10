import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

// GET /api/collaborators/featured - Buscar colaboradores em destaque
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    const collaborators = await prisma.collaborator.findMany({
      where: { OR: [{ isActive: true }, { isActive: undefined }], featured: true },
      orderBy: [{ orderInt: 'asc' }, { createdAt: 'desc' }],
      take: Math.min(limit, 20)
    })

    return NextResponse.json(successResponse(collaborators as any))
  } catch (error) {
    console.error('Erro ao buscar colaboradores em destaque:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
