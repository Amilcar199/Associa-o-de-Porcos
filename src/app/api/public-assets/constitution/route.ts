import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authMiddleware } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function isImage(filePath: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function walkDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath))
    } else if (entry.isFile() && isImage(fullPath)) {
      files.push(fullPath)
    }
  }
  return files
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const baseDir = path.join(process.cwd(), 'src', 'components', 'assets', 'Conteudos Suinos', 'pdf_paginas_png')
    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ success: true, data: [] })
    }

    const files = walkDir(baseDir)
    const data = files.map((absPath) => {
      const rel = path.relative(baseDir, absPath).split(path.sep).join('/')
      const stat = fs.statSync(absPath)
      const ext = path.extname(absPath).toLowerCase()
      const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'application/octet-stream'
      return {
        url: `/api/public-assets/constitution/image?name=${encodeURIComponent(rel)}`,
        filename: path.basename(absPath),
        size: stat.size,
        contentType,
        uploadedAt: stat.mtime.toISOString(),
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao listar imagens de assets:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

