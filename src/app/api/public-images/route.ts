import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authMiddleware } from '@/lib/api-utils'
import connectDB from '@/lib/mongodb'
import LegalSection from '@/models/LegalContent'

export const dynamic = 'force-dynamic'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])

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

    const publicDir = path.join(process.cwd(), 'public')
    const results: Array<{ url: string; filename: string; size: number; contentType: string; uploadedAt: string }> = []

    if (fs.existsSync(publicDir)) {
      const files = walkDir(publicDir)
      for (const absPath of files) {
        const rel = path.relative(publicDir, absPath).split(path.sep).join('/')
        const stat = fs.statSync(absPath)
        const ext = path.extname(absPath).toLowerCase()
        const contentType =
          ext === '.png' ? 'image/png' :
          ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
          ext === '.webp' ? 'image/webp' :
          ext === '.gif' ? 'image/gif' :
          ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream'
        results.push({
          url: `/${rel}`,
          filename: path.basename(absPath),
          size: stat.size,
          contentType,
          uploadedAt: stat.mtime.toISOString()
        })
      }
    }

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Erro ao listar imagens públicas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const relPath = (searchParams.get('path') || '').replace(/^\/+/, '')
    if (!relPath) return NextResponse.json({ error: 'Caminho inválido' }, { status: 400 })

    const publicDir = path.join(process.cwd(), 'public')
    const abs = path.normalize(path.join(publicDir, relPath))
    if (!abs.startsWith(publicDir)) return NextResponse.json({ error: 'Caminho inválido' }, { status: 400 })

    if (!fs.existsSync(abs)) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    const stat = fs.statSync(abs)
    if (!stat.isFile()) return NextResponse.json({ error: 'Não é um arquivo' }, { status: 400 })

    fs.unlinkSync(abs)
    // Remover referências no modelo LegalSection
    try {
      await connectDB()
      const url = `/${relPath}`
      await (LegalSection as any).updateMany({}, { $pull: { items: { url } } })
    } catch (e) {
      console.error('Falha ao limpar referências em LegalSection:', e)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar imagem pública:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

