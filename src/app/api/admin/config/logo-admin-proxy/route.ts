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
      const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://assuino.com'}${url}`, { cache: 'no-store' })
      const arrayBuf = await res.arrayBuffer()
      return new NextResponse(arrayBuf, { headers: { 'Content-Type': res.headers.get('Content-Type') || 'image/png' } })
    }
    // Use the bundled asset URL because Next.js adds a content hash to static assets.
    return NextResponse.redirect(new URL(LogoPng.src, req.url))
  } catch {
    return NextResponse.redirect(new URL(LogoPng.src, req.url))
  }
}
