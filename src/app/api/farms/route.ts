export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  successResponse,
  errorResponse,
  sanitizeInput,
  isValidEmail,
  getPaginationParams,
  paginateResults,
} from '@/lib/api-utils'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'

// GET /api/farms - Lista pública de fazendas aprovadas (opcionalmente filtradas por província)
// Usado, por exemplo, para listar produtores de uma província no popup do mapa.
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const province = searchParams.get('province')

    const query: any = { status: 'approved', isActive: true }
    if (province) query.province = province

    const result = await paginateResults(Farm, query, {
      ...pagination,
      sort: pagination.sort || 'createdAt',
    })

    // Nunca expor dados de contacto publicamente na listagem
    result.data = (result.data as any[]).map((farm) => ({
      _id: farm._id,
      producerName: farm.producerName,
      farmName: farm.farmName,
      province: farm.province,
      municipality: farm.municipality,
      herd: farm.herd,
      createdAt: farm.createdAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/farms - Cadastro público de uma fazenda (fica pendente de aprovação do admin)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const data = sanitizeInput(body)

    // Validações obrigatórias
    if (!data.producerName) {
      return errorResponse('Nome do produtor é obrigatório')
    }
    if (!data.province || !ANGOLA_PROVINCE_NAMES.includes(data.province)) {
      return errorResponse('Selecione uma província válida de Angola')
    }
    if (!data.herd || typeof data.herd !== 'object') {
      return errorResponse('Informe os dados do rebanho (total, fêmeas, abate, reprodução)')
    }

    const total = Number(data.herd.total)
    const females = Number(data.herd.females ?? 0)
    const forSlaughter = Number(data.herd.forSlaughter ?? 0)
    const forBreeding = Number(data.herd.forBreeding ?? 0)

    if (!Number.isFinite(total) || total < 0) {
      return errorResponse('Quantidade total de porcos inválida')
    }
    if ([females, forSlaughter, forBreeding].some((n) => !Number.isFinite(n) || n < 0)) {
      return errorResponse('Os valores do rebanho não podem ser negativos')
    }
    if (females > total || forSlaughter > total || forBreeding > total) {
      return errorResponse('Nenhuma subcategoria do rebanho pode ser maior que o total')
    }

    if (data.email && !isValidEmail(data.email)) {
      return errorResponse('Email inválido')
    }

    let coordinates: { lat: number; lng: number } | undefined
    if (data.coordinates && typeof data.coordinates === 'object') {
      const lat = Number(data.coordinates.lat)
      const lng = Number(data.coordinates.lng)
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        coordinates = { lat, lng }
      }
    }

    // Se o utilizador estiver autenticado, associamos a fazenda à conta dele
    const session = await getServerSession(authOptions).catch(() => null)
    const owner = (session as any)?.user?.id || (session as any)?.user?._id

    const farm = new Farm({
      producerName: data.producerName,
      farmName: data.farmName || undefined,
      province: data.province,
      municipality: data.municipality || undefined,
      coordinates,
      phone: data.phone || undefined,
      email: data.email || undefined,
      herd: { total, females, forSlaughter, forBreeding },
      notes: data.notes || undefined,
      status: 'pending',
      owner: owner || undefined,
    })

    await farm.save()

    return NextResponse.json(
      successResponse(
        { id: farm._id },
        'Cadastro enviado com sucesso! A sua fazenda será exibida no mapa após a aprovação da equipa da associação.'
      ),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao cadastrar fazenda:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }

    return errorResponse('Erro interno do servidor', 500)
  }
}
