export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { parsePigOffer } from '@/lib/pig-listings'
import User from '@/models/User'
import { hasProPlan } from '@/lib/notify-users'
import { PRODUCT_AUDIT_FIELDS, changedFields } from '@/lib/audit'
import { recordAudit } from '@/lib/record-audit'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Anúncio inválido')

    await connectDB()
    const product = await Product.findOne({ _id: params.id, seller: userId, isActive: true })
    if (!product) return errorResponse('Anúncio não encontrado', 404)
    if (product.listingStatus === 'sold') return errorResponse('Um anúncio vendido não pode ser editado')

    const body = sanitizeInput(await req.json())
    if (typeof body.highlighted === 'boolean' && Object.keys(body).length === 1) {
      if (body.highlighted) {
        const owner = await User.findById(userId).select('plan planExpiresAt').lean() as { plan?: string; planExpiresAt?: Date | null } | null
        if (!hasProPlan(owner)) return errorResponse('O destaque faz parte do Plano Pro', 403)
        if (product.listingStatus && product.listingStatus !== 'approved') {
          return errorResponse('O anúncio precisa de estar aprovado para ficar em destaque')
        }
      }
      const beforeHighlight = product.highlighted
      product.highlighted = body.highlighted
      await product.save()
      await recordAudit({
        actorId: String(userId),
        action: 'offer.highlight',
        entity: 'product',
        entityId: String(product._id),
        summary: product.name,
        changes: { highlighted: { from: beforeHighlight, to: product.highlighted } },
      })
      return NextResponse.json(successResponse(product, body.highlighted ? 'Anúncio em destaque' : 'Destaque retirado'))
    }

    if (body.listingStatus === 'sold') {
      product.listingStatus = 'sold'
      product.availability = 'sold'
      await product.save()
      await recordAudit({
        actorId: String(userId),
        action: 'offer.sold',
        entity: 'product',
        entityId: String(product._id),
        summary: product.name,
      })
      return NextResponse.json(successResponse(product, 'Anúncio marcado como vendido'))
    }

    const parsed = parsePigOffer(body)
    if (!parsed.data) return errorResponse(parsed.error || 'Dados inválidos')
    const before = product.toObject()
    Object.assign(product, parsed.data)
    product.listingStatus = 'pending'
    product.availability = 'reserved'
    product.rejectionNote = undefined
    await product.save()
    await recordAudit({
      actorId: String(userId),
      action: 'offer.update',
      entity: 'product',
      entityId: String(product._id),
      summary: product.name,
      changes: changedFields(before, product.toObject(), PRODUCT_AUDIT_FIELDS),
    })
    return NextResponse.json(successResponse(product, 'Anúncio actualizado e reenviado para aprovação'))
  } catch (error: any) {
    console.error('Erro ao editar anúncio de suíno:', error)
    if (error?.name === 'ValidationError') return errorResponse('Não foi possível guardar o anúncio')
    return errorResponse('Erro interno do servidor', 500)
  }
}
