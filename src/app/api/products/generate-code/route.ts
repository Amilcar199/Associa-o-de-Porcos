import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { breed } = await req.json()
    
    if (!breed) {
      return errorResponse('Raça é obrigatória para gerar código')
    }

    // Gerar código automático via prisma
    const year = new Date().getFullYear()
    const prefix = `${String(breed).toUpperCase()}-${year}-`
    const last = await prisma.product.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true }
    })
    let seq = 1
    if (last?.code) {
      const parts = last.code.split('-')
      const n = parseInt(parts[2] || '0', 10)
      if (!Number.isNaN(n)) seq = n + 1
    }
    const code = `${prefix}${String(seq).padStart(3, '0')}`
    
    return NextResponse.json(successResponse({ code }, 'Código gerado com sucesso'))
  } catch (error) {
    console.error('Erro ao gerar código:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}