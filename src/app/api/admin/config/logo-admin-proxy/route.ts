import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'
import LogoPng from '@/components/assets/Logo.png'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const cfg: any = await SiteConfig.findOne().lean()
    const url = cfg?.adminLogoUrl || cfg?.logoUrl || ''
    if (url && url.startsWith('/api/images/')) {
      // Proxy para a imagem do GridFS
      const res = await fetch(`${process.env.NEXTAUTH_URL || ''}${url}`, { cache: 'no-store' })
      const arrayBuf = await res.arrayBuffer()
      return new NextResponse(arrayBuf, { headers: { 'Content-Type': res.headers.get('Content-Type') || 'image/png' } })
    }
    // Fallback para logo estática
    return NextResponse.redirect(new URL('/_next/static/media/Logo.png', req.url))
  } catch {
    return NextResponse.redirect(new URL('/_next/static/media/Logo.png', req.url))
  }
}

