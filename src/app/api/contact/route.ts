export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  sanitizeInput,
  isValidEmail
} from '@/lib/api-utils'
import { sendContactNotification } from '@/lib/email'

// POST /api/contact - Criar nova mensagem de contato (público)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validações básicas
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.subject || !sanitizedData.message) {
      return errorResponse('Todos os campos obrigatórios devem ser preenchidos')
    }

    if (!isValidEmail(sanitizedData.email)) {
      return errorResponse('Email inválido')
    }

    if (sanitizedData.message.length < 10) {
      return errorResponse('Mensagem deve ter pelo menos 10 caracteres')
    }

    if (sanitizedData.message.length > 2000) {
      return errorResponse('Mensagem não pode ter mais que 2000 caracteres')
    }

    // Criar contato (Prisma / MySQL)
    const contact = await prisma.contact.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone || null,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        status: 'new'
      },
      select: { id: true }
    })

    // Enviar notificação por email para o admin (se configurado)
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendContactNotification(process.env.ADMIN_EMAIL, {
          name: sanitizedData.name,
          email: sanitizedData.email,
          subject: sanitizedData.subject,
          message: sanitizedData.message
        })
      } catch (error) {
        console.error('Erro ao enviar notificação por email:', error)
        // Não falhar se o email não for enviado
      }
    }

    return NextResponse.json(
      successResponse(
        { id: contact.id },
        'Mensagem enviada com sucesso! Entraremos em contato em breve.'
      ),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar contato:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}
