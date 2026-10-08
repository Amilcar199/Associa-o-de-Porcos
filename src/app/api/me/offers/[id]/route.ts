export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { parsePigOffer } from '@/lib/pig-listings'

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
    if (body.listingStatus === 'sold') {
      product.listingStatus = 'sold'
      product.availability = 'sold'
      await product.save()
      return NextResponse.json(successResponse(product, 'Anúncio marcado como vendido'))
    }

    const parsed = parsePigOffer(body)
    if (!parsed.data) return errorResponse(parsed.error || 'Dados inválidos')
    Object.assign(product, parsed.data)
    product.listingStatus = 'pending'
    product.availability = 'reserved'
    product.rejectionNote = undefined
    await product.save()
    return NextResponse.json(successResponse(product, 'Anúncio actualizado e reenviado para aprovação'))
  } catch (error: any) {
    console.error('Erro ao editar anúncio de suíno:', error)
    if (error?.name === 'ValidationError') return errorResponse('Não foi possível guardar o anúncio')
    return errorResponse('Erro interno do servidor', 500)
  }
}
