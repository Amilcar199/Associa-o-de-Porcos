export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, sanitizeInput, isValidEmail } from '@/lib/api-utils';
import { sendWelcomeEmail, sendEmail } from '@/lib/email';
import crypto from 'crypto'
import { isPasswordStrong } from '@/lib/password'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/auth/register - Registrar novo usuário
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    // Validações
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.password) {
      return errorResponse('Nome, email e senha são obrigatórios');
    }

    if (!isValidEmail(sanitizedData.email)) {
      return errorResponse('Email inválido');
    }

    if (!isPasswordStrong(sanitizedData.password)) {
      return errorResponse('Senha fraca: mínimo 6 caracteres, ao menos um número e sem sequências numéricas (ex.: 123, 321)');
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({ where: { email: sanitizedData.email.toLowerCase() } });
    if (existingUser) {
      return errorResponse('Email já está em uso');
    }


    // Normalizar role: aceitar somente 'admin' | 'member' | 'visitor'
    let role: 'admin' | 'member' | 'visitor' = 'member'
    if (['admin', 'member', 'visitor'].includes(sanitizedData.role)) {
      role = sanitizedData.role
    }

    // Regra: se role for 'member', exigir bio/descrição
    if (role === 'member') {
      if (!sanitizedData.bio || !String(sanitizedData.bio).trim()) {
        return errorResponse('Descrição é obrigatória para membros')
      }
    }

    const passwordHash = await bcrypt.hash(sanitizedData.password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email.toLowerCase(),
        password: passwordHash,
        phone: sanitizedData.phone || undefined,
        company: sanitizedData.company || undefined,
        bio: sanitizedData.bio || undefined,
        role,
        isActive: sanitizedData.isActive !== undefined ? Boolean(sanitizedData.isActive) : true,
        preferences: {
          newsletter: true,
          notifications: true
        } as any
      }
    })

    // Opcional: enviar email de boas-vindas
    try { await sendWelcomeEmail(sanitizedData.email, sanitizedData.name) } catch {}

    // Retornar usuário sem senha
    const userResponse = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      company: user.company,
      bio: user.bio,
      location: user.location,
      website: user.website,
      socialMedia: user.socialMedia,
      createdAt: user.createdAt
    }

    return NextResponse.json(
      successResponse(userResponse, 'Conta criada com sucesso!'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return errorResponse(`Erro de validação: ${errors.join(', ')}`);
    }
    
    return errorResponse('Erro interno do servidor', 500);
  }
}
