export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { parseOwnerFarm } from '@/lib/farm-owner'
import { NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Fazenda inválida')

    const parsed = parseOwnerFarm(sanitizeInput(await req.json()))
    if (!parsed.data) return errorResponse(parsed.error || 'Dados inválidos')

    await connectDB()
    const farm = await Farm.findOne({ _id: params.id, owner: userId, isActive: true })
    if (!farm) return errorResponse('Fazenda não encontrada', 404)

    Object.assign(farm, parsed.data)
    if (farm.status === 'rejected') farm.status = 'pending'
    await farm.save()
    return NextResponse.json(successResponse(farm, 'Fazenda actualizada'))
  } catch (error: any) {
    console.error('Erro ao actualizar fazenda do produtor:', error)
    if (error?.name === 'ValidationError') return errorResponse('Não foi possível guardar a fazenda')
    return errorResponse('Erro interno do servidor', 500)
  }
}
