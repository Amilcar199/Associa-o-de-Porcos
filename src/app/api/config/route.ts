export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'
import { pickPublicSiteConfig } from '@/lib/public-site-config'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    await connectDB()
    const cfg = await SiteConfig.findOne().lean()
    return NextResponse.json(successResponse(pickPublicSiteConfig(cfg as Record<string, unknown>)))
  } catch (error) {
    console.error('Erro ao buscar config pública:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
