export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { parseOwnerFarm } from '@/lib/farm-owner'

async function currentUserId() {
  const session = await getServerSession(authOptions)
  const id = (session as any)?.user?.id
  if (!session?.user || !id) return null
  return String(id)
}

export async function GET() {
  try {
    const userId = await currentUserId()
    if (!userId) return errorResponse('Não autorizado', 401)
    await connectDB()
    const farms = await Farm.find({ owner: userId, isActive: true }).sort({ updatedAt: -1 }).limit(20).lean()
    return NextResponse.json(successResponse(farms))
  } catch (error) {
    console.error('Erro ao listar fazendas do produtor:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await currentUserId()
    if (!userId) return errorResponse('Não autorizado', 401)
    const parsed = parseOwnerFarm(sanitizeInput(await req.json()))
    if (!parsed.data) return errorResponse(parsed.error || 'Dados inválidos')

    await connectDB()
    const farm = await Farm.create({
      ...parsed.data,
      owner: userId,
      status: 'pending',
      isActive: true,
    })
    return NextResponse.json(successResponse(farm, 'Fazenda registada e aguarda aprovação'), { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar fazenda do produtor:', error)
    if (error?.name === 'ValidationError') return errorResponse('Não foi possível guardar a fazenda')
    return errorResponse('Erro interno do servidor', 500)
  }
}
