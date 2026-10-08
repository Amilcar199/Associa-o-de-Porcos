export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import ListingInterest from '@/models/ListingInterest'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { publicListingFilter } from '@/lib/pig-listings'
import { rateLimitOrNull } from '@/lib/rate-limit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimitOrNull(req, { key: 'listing-interest', limit: 8, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Anúncio inválido')
    const body = sanitizeInput(await req.json())
    const name = String(body.name || '').trim().slice(0, 100)
    const phone = String(body.phone || '').replace(/[^\d+]/g, '')
    const message = String(body.message || '').trim().slice(0, 500)
    if (name.length < 2) return errorResponse('O nome é obrigatório')
    if (phone.length < 8) return errorResponse('O telefone é obrigatório')

    await connectDB()
    const product = await Product.findOne({ _id: params.id, ...publicListingFilter() }).select('_id')
    if (!product) return errorResponse('Anúncio não encontrado', 404)

    await ListingInterest.create({ product: product._id, name, phone, message: message || undefined })
    return NextResponse.json(successResponse({}, 'Interesse enviado ao anunciante'), { status: 201 })
  } catch (error) {
    console.error('Erro ao registar interesse:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
