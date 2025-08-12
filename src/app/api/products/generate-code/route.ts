import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { successResponse, errorResponse } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { breed } = await req.json()
    
    if (!breed) {
      return errorResponse('Raça é obrigatória para gerar código')
    }

    // Gerar código automático usando o método estático do modelo
    const code = await Product.generateCode(breed)
    
    return NextResponse.json(successResponse({ code }, 'Código gerado com sucesso'))
  } catch (error) {
    console.error('Erro ao gerar código:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}