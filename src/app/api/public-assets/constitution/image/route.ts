import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authMiddleware } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || ''
    if (!name) return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })

    const baseDir = path.join(process.cwd(), 'src', 'components', 'assets', 'Conteudos Suinos', 'pdf_paginas_png')
    const abs = path.normalize(path.join(baseDir, name))
    if (!abs.startsWith(baseDir)) return NextResponse.json({ error: 'Caminho inválido' }, { status: 400 })
    if (!fs.existsSync(abs)) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })

    const stat = fs.statSync(abs)
    const ext = path.extname(abs).toLowerCase()
    const contentType =
      ext === '.png' ? 'image/png' :
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.webp' ? 'image/webp' : 'application/octet-stream'

    const stream = fs.createReadStream(abs)
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stat.size)
      }
    })
  } catch (error) {
    console.error('Erro ao servir imagem de assets:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

