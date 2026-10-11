export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, sanitizeInput, successResponse, validateSession } from '@/lib/api-utils'
import { changedFields } from '@/lib/audit'
import { recordAudit } from '@/lib/record-audit'

const STATUSES = ['approved', 'rejected', 'sold', 'expired'] as const

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const body = sanitizeInput(await req.json())
    const listingStatus = body.listingStatus
    if (!STATUSES.includes(listingStatus)) return errorResponse('Estado inválido')

    await connectDB()
    const product = await Product.findById(params.id)
    if (!product) return errorResponse('Anúncio não encontrado', 404)

    const before = { listingStatus: product.listingStatus, availability: product.availability }
    product.listingStatus = listingStatus
    if (listingStatus === 'approved') product.availability = 'available'
    if (listingStatus === 'rejected' || listingStatus === 'expired') product.availability = 'reserved'
    if (listingStatus === 'sold') product.availability = 'sold'
    if (listingStatus === 'rejected') product.rejectionNote = String(body.rejectionNote || '').slice(0, 300)
    await product.save()
    await recordAudit({
      actorId: (auth.user as { id?: string }).id,
      action: 'listing.update',
      entity: 'product',
      entityId: String(product._id),
      summary: product.name,
      changes: changedFields(before, { listingStatus: product.listingStatus, availability: product.availability }, ['listingStatus', 'availability']),
    })
    return NextResponse.json(successResponse(product, 'Estado do anúncio actualizado'))
  } catch (error) {
    console.error('Erro ao moderar anúncio:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
