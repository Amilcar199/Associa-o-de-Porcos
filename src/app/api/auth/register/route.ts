export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput, isValidEmail } from '@/lib/api-utils';
import { sendWelcomeEmail, getVerificationCodeTemplate, sendEmail } from '@/lib/email';
import crypto from 'crypto'

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


    // Criar usuário
    const userData = {
      name: sanitizedData.name,
      email: sanitizedData.email,
      password: sanitizedData.password,
      phone: sanitizedData.phone || undefined,
      company: sanitizedData.company || undefined,
      bio: sanitizedData.bio || undefined,
      role: sanitizedData.role || 'member', // Aceita role personalizado ou usa 'member' como padrão
      isActive: sanitizedData.isActive !== undefined ? sanitizedData.isActive : true,
      emailVerified: false,
      preferences: {
        newsletter: true,
        notifications: true
      }
    };

    const user = new User(userData);
    // Gerar código 6 dígitos
    const code = (Math.floor(100000 + Math.random() * 900000)).toString()
    user.emailVerificationCode = code
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save();

    // Enviar email com código de verificação
    try {
      const tpl = getVerificationCodeTemplate(sanitizedData.name, code)
      await sendEmail({ to: sanitizedData.email, subject: tpl.subject, html: tpl.html, text: tpl.text })
    } catch (error) {
      console.error('Erro ao enviar código de verificação:', error);
    }

    // Retornar usuário sem senha
    const userResponse = user.toPublicJSON();

    return NextResponse.json(
      successResponse(userResponse, 'Conta criada com sucesso! Verifique seu email para ativar a conta.'),
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
