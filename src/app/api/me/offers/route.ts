export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { parsePigOffer } from '@/lib/pig-listings'
import { rateLimitOrNull } from '@/lib/rate-limit'

async function ownerId() {
  const session = await getServerSession(authOptions)
  const id = (session as any)?.user?.id
  if (!session?.user || !id) return null
  return String(id)
}

export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'pig-offer', limit: 8, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const userId = await ownerId()
    if (!userId) return errorResponse('Não autorizado', 401)
    const parsed = parsePigOffer(sanitizeInput(await req.json()))
    if (!parsed.data) return errorResponse(parsed.error || 'Dados inválidos')

    await connectDB()
    const product = await Product.create({
      ...parsed.data,
      code: await Product.generateCode(String(parsed.data.breed)),
      seller: userId,
      listingStatus: 'pending',
      availability: 'reserved',
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    })
    return NextResponse.json(successResponse(product, 'Anúncio enviado para aprovação'), { status: 201 })
  } catch (error: any) {
    console.error('Erro ao publicar anúncio de suíno:', error)
    if (error?.name === 'ValidationError') return errorResponse('Não foi possível publicar o anúncio')
    return errorResponse('Erro interno do servidor', 500)
  }
}
