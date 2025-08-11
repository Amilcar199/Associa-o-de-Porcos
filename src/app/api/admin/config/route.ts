export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'
import { validateSession, errorResponse, successResponse } from '@/lib/api-utils'

export async function GET() {
  try {
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
    if (typeof body.currency === 'string') update.currency = body.currency
    if (typeof body.locale === 'string') update.locale = body.locale
    if (typeof body.contactEmail === 'string') update.contactEmail = body.contactEmail

    const cfg = await SiteConfig.findOneAndUpdate({}, update, { new: true, upsert: true })
    return NextResponse.json(successResponse(cfg, 'Configurações atualizadas'))
  } catch (error) {
    console.error('Erro ao salvar config:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}