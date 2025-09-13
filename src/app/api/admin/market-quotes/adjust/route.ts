export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MarketQuote from '@/models/MarketQuote'
import { errorResponse, successResponse, validateSession } from '@/lib/api-utils'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const body = await req.json()
    const id = String(body.id)
    const percent = Number(body.percent)
    const publish = Boolean(body.publish)
    if (!id || Number.isNaN(percent)) return errorResponse('Parâmetros inválidos', 400)

    const doc: any = await (MarketQuote as any).findById(id)
    if (!doc) return errorResponse('Não encontrado', 404)

    const factor = 1 + (percent / 100)
    if (typeof doc.refPricePerKg === 'number') doc.refPricePerKg = doc.refPricePerKg * factor
    if (typeof doc.refPricePerHead === 'number') doc.refPricePerHead = doc.refPricePerHead * factor
    if (publish) {
      doc.status = 'approved'
      doc.approvedBy = (auth.user as any)?.id
    }
    await doc.save()
    return NextResponse.json(successResponse(doc))
  } catch (error: any) {
    console.error('Erro em POST /admin/market-quotes/adjust:', error)
    return errorResponse(error?.message || 'Erro interno do servidor', 500)
  }
}

