export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'
import { validateSession, errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    await connectDB()
    const cfg = await SiteConfig.findOne().lean()
    return NextResponse.json(successResponse(cfg || {}))
  } catch (error) {
    console.error('Erro ao buscar config:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const body = await req.json()
    const update: any = {}
    if (typeof body.logoUrl === 'string') update.logoUrl = body.logoUrl
    if (typeof body.publicLogoUrl === 'string') update.publicLogoUrl = body.publicLogoUrl
    if (typeof body.adminLogoUrl === 'string') update.adminLogoUrl = body.adminLogoUrl
    if (typeof body.currency === 'string') update.currency = body.currency
    if (typeof body.locale === 'string') update.locale = body.locale
    if (typeof body.contactEmail === 'string') update.contactEmail = body.contactEmail
    if (typeof body.contactPhone === 'string') update.contactPhone = body.contactPhone
    if (typeof body.whatsappNumber === 'string') update.whatsappNumber = body.whatsappNumber
    if (typeof body.facebookUrl === 'string') update.facebookUrl = body.facebookUrl
    if (typeof body.instagramUrl === 'string') update.instagramUrl = body.instagramUrl
    if (typeof body.linkedinUrl === 'string') update.linkedinUrl = body.linkedinUrl
    if (typeof body.youtubeUrl === 'string') update.youtubeUrl = body.youtubeUrl
    if (typeof body.twitterUrl === 'string') update.twitterUrl = body.twitterUrl
    if (typeof body.tiktokUrl === 'string') update.tiktokUrl = body.tiktokUrl

    const cfg = await SiteConfig.findOneAndUpdate({}, update, { new: true, upsert: true })
    return NextResponse.json(successResponse(cfg, 'Configurações atualizadas'))
  } catch (error) {
    console.error('Erro ao salvar config:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}