import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LegalSection from '@/models/LegalContent'
import { authMiddleware } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const sections = await LegalSection.find({}).lean()
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

    await connectDB()
    const body = await request.json()
    const sections = Array.isArray(body?.sections) ? body.sections : []

    // Upsert por key, preservando itens existentes e acrescentando novos
    for (const s of sections) {
      if (!s?.key) continue
      const incomingItems = Array.isArray(s.items) ? s.items : []
      const existingDoc: any = await LegalSection.findOne({ key: s.key }).lean()
      const existingItems = Array.isArray(existingDoc?.items) ? (existingDoc.items as any[]) : []
      // Mapear por URL para mesclar (atualiza título/descrição dos que vierem no payload)
      const byUrl: Record<string, { url: string; title?: string; description?: string }> = {}
      for (const it of existingItems) {
        if (it?.url) byUrl[it.url] = { url: it.url, title: it.title || '', description: it.description || '' }
      }
      for (const it of incomingItems) {
        if (it?.url) byUrl[it.url] = { url: it.url, title: it.title || '', description: it.description || '' }
      }
      const mergedItems = Object.values(byUrl)
      await LegalSection.updateOne(
        { key: s.key },
        { $set: { title: s.title || '', description: s.description || '', items: mergedItems, updatedBy: String((auth as any)?.user?.email || '') } },
        { upsert: true }
      )
    }

    const updated = await LegalSection.find({}).lean()
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Erro ao atualizar conteúdo legal:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

