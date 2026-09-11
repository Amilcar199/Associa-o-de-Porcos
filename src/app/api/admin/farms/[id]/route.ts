export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: { id: string }
}

// PATCH /api/admin/farms/[id] - Aprovar, rejeitar ou editar um cadastro (admin)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return errorResponse('ID de fazenda inválido')
    }

    const body = await req.json()
    const data = sanitizeInput(body)

    const farm = await Farm.findById(id)
    if (!farm) {
      return errorResponse('Cadastro não encontrado', 404)
    }

    if (data.status && ['pending', 'approved', 'rejected'].includes(data.status)) {
      farm.status = data.status
    }
    if (typeof data.isActive === 'boolean') {
      farm.isActive = data.isActive
    }
    if (data.herd && typeof data.herd === 'object') {
      farm.herd = {
        total: Number(data.herd.total ?? farm.herd.total),
        females: Number(data.herd.females ?? farm.herd.females),
        forSlaughter: Number(data.herd.forSlaughter ?? farm.herd.forSlaughter),
        forBreeding: Number(data.herd.forBreeding ?? farm.herd.forBreeding),
      }
    }
    if (data.producerName) farm.producerName = data.producerName
    if (data.farmName !== undefined) farm.farmName = data.farmName
    if (data.province) farm.province = data.province
    if (data.municipality !== undefined) farm.municipality = data.municipality
    if (data.notes !== undefined) farm.notes = data.notes

    await farm.save()

    return NextResponse.json(successResponse(farm, 'Cadastro atualizado com sucesso'))
  } catch (error: any) {
    console.error('Erro ao atualizar fazenda:', error)
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/admin/farms/[id] - Remover um cadastro (admin)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return errorResponse('ID de fazenda inválido')
    }

    const farm = await Farm.findByIdAndDelete(id)
    if (!farm) {
      return errorResponse('Cadastro não encontrado', 404)
    }

    return NextResponse.json(successResponse(null, 'Cadastro removido com sucesso'))
  } catch (error) {
    console.error('Erro ao remover fazenda:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
