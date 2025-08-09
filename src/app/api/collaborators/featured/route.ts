import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Collaborator from '@/models/Collaborator'
import { successResponse, errorResponse } from '@/lib/api-utils'

// GET /api/collaborators/featured - Buscar colaboradores em destaque
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '4')

    const collaborators = await Collaborator.find({ 
      isActive: true, 
      featured: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .limit(Math.min(limit, 20)) // Máximo 20 colaboradores
    .lean()

    return NextResponse.json(successResponse(collaborators))
  } catch (error) {
    console.error('Erro ao buscar colaboradores em destaque:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
