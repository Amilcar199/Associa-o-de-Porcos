export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput, isValidEmail } from '@/lib/api-utils';
import { sendWelcomeEmail, sendEmail } from '@/lib/email';
import crypto from 'crypto'
import { isPasswordStrong } from '@/lib/password'

// POST /api/auth/register - Registrar novo usuário
export async function POST(req: NextRequest) {
  try {
    await connectDB();

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
    const existingUser = await User.findOne({ email: sanitizedData.email });
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

    // Criar usuário
    const userData = {
      name: sanitizedData.name,
      email: sanitizedData.email,
      password: sanitizedData.password,
      phone: sanitizedData.phone || undefined,
      company: sanitizedData.company || undefined,
      bio: sanitizedData.bio || undefined,
      role,
      isActive: sanitizedData.isActive !== undefined ? sanitizedData.isActive : true,
      preferences: {
        newsletter: true,
        notifications: true
      }
    };

    const user = new User(userData);
    await user.save();

    // Opcional: enviar email de boas-vindas
    try { await sendWelcomeEmail(sanitizedData.email, sanitizedData.name) } catch {}

    // Retornar usuário sem senha
    const userResponse = user.toPublicJSON();

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
