export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput, isValidEmail } from '@/lib/api-utils';
import { sendWelcomeEmail } from '@/lib/email';

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

    if (sanitizedData.password.length < 6) {
      return errorResponse('Senha deve ter pelo menos 6 caracteres');
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email: sanitizedData.email });
    if (existingUser) {
      return errorResponse('Email já está em uso');
    }

    // Criptografar senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(sanitizedData.password, saltRounds);

    // Criar usuário
    const userData = {
      name: sanitizedData.name,
      email: sanitizedData.email,
      password: hashedPassword,
      phone: sanitizedData.phone || undefined,
      company: sanitizedData.company || undefined,
      role: 'member', // Usuários registrados são membros por padrão
      isActive: true,
      emailVerified: false,
      preferences: {
        newsletter: true,
        notifications: true
      }
    };

    const user = new User(userData);
    await user.save();

    // Enviar email de boas-vindas (opcional)
    try {
      await sendWelcomeEmail(sanitizedData.email, sanitizedData.name);
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      // Não falhar se o email não for enviado
    }

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
