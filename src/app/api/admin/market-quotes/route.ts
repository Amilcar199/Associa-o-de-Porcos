export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MarketQuote from '@/models/MarketQuote'
import { errorResponse, successResponse, getPaginationParams, validateSession } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { searchParams } = new URL(req.url)
    const { page = 1, limit = 10, sort = 'updatedAt', order = 'desc' } = getPaginationParams(searchParams)
    const region = searchParams.get('region') || undefined
    const status = searchParams.get('status') || undefined

    const query: any = {}
    if (region) query.region = new RegExp(region, 'i')
    if (status) query.status = status

    const skip = (page - 1) * limit
    const [results, total] = await Promise.all([
      (MarketQuote as any).find(query).sort({ [sort]: order === 'asc' ? 1 : -1 }).skip(skip).limit(limit).lean(),
      (MarketQuote as any).countDocuments(query)
    ])
    const pages = Math.ceil(total / limit)

    return NextResponse.json(successResponse({ results, pagination: { page, limit, total, pages } }))
  } catch (error) {
    console.error('Erro em GET /admin/market-quotes:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const body = await req.json()
    const payload = {
      weekISO: String(body.weekISO),
      region: String(body.region).trim(),
      saleForm: body.saleForm,
      status: body.status || 'draft',
      refPricePerKg: Number(body.refPricePerKg),
      refPricePerHead: body.refPricePerHead != null ? Number(body.refPricePerHead) : undefined,
      minSamples: Number(body.minSamples ?? 0),
      methodologyNote: body.methodologyNote || undefined,
      createdBy: (auth.user as any)?.id
    }
    const doc = await (MarketQuote as any).create(payload)
    return NextResponse.json(successResponse(doc), { status: 201 })
  } catch (error: any) {
    console.error('Erro em POST /admin/market-quotes:', error)
    return errorResponse(error?.message || 'Erro interno do servidor', 500)
  }
}
