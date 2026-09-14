export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MarketQuote from '@/models/MarketQuote'
import { errorResponse, successResponse, validateSession } from '@/lib/api-utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    const id = params.id
    const body = await req.json()

    const updates: any = { ...body }
    if (updates.approve === true) {
      updates.status = 'approved'
      updates.approvedBy = (auth.user as any)?.id
      delete updates.approve
    }

    const doc = await (MarketQuote as any).findByIdAndUpdate(id, updates, { new: true })
    if (!doc) return errorResponse('Não encontrado', 404)
    return NextResponse.json(successResponse(doc))
  } catch (error: any) {
    console.error('Erro em PATCH /admin/market-quotes/:id:', error)
    return errorResponse(error?.message || 'Erro interno do servidor', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    const id = params.id
    const res = await (MarketQuote as any).findByIdAndDelete(id)
    if (!res) return errorResponse('Não encontrado', 404)
    return NextResponse.json(successResponse({ deleted: true }))
  } catch (error) {
    console.error('Erro em DELETE /admin/market-quotes/:id:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
