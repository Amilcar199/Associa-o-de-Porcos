import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authMiddleware } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sections = await prisma.legalSection.findMany()
    return NextResponse.json({ success: true, data: sections })
  } catch (error) {
    console.error('Erro ao obter conteúdo legal:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const sections = Array.isArray(body?.sections) ? body.sections : []

    for (const s of sections) {
      if (!s?.key) continue
      const incomingItems = Array.isArray(s.items) ? s.items : []
      const existing = await prisma.legalSection.findUnique({ where: { key: s.key } })
      const existingItems = Array.isArray((existing as any)?.items) ? ((existing as any).items as any[]) : []
      const byUrl: Record<string, { url: string; title?: string; description?: string }> = {}
      for (const it of existingItems) {
        if (it?.url) byUrl[it.url] = { url: it.url, title: it.title || '', description: it.description || '' }
      }
      for (const it of incomingItems) {
        if (it?.url) byUrl[it.url] = { url: it.url, title: it.title || '', description: it.description || '' }
      }
      const mergedItems = Object.values(byUrl)
      await prisma.legalSection.upsert({
        where: { key: s.key },
        create: {
          key: s.key,
          title: s.title || '',
          description: s.description || '',
          items: mergedItems as any,
          updatedBy: String((auth as any)?.user?.email || '')
        },
        update: {
          title: s.title || '',
          description: s.description || '',
          items: mergedItems as any,
          updatedBy: String((auth as any)?.user?.email || '')
        }
      })
    }

    const updated = await prisma.legalSection.findMany()
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Erro ao atualizar conteúdo legal:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

