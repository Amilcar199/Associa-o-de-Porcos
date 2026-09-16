export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput, isValidEmail } from '@/lib/api-utils';
import { sendWelcomeEmail } from '@/lib/email';
import { syncNewsletterPreference } from '@/lib/notifications'
import { isPasswordStrong, PASSWORD_POLICY_MESSAGE } from '@/lib/password'
import { rateLimitOrNull } from '@/lib/rate-limit'

// POST /api/auth/register - Registrar novo usuário
export async function POST(req: NextRequest) {
  // Máx. 5 registos por IP a cada 15 minutos — evita criação em massa de contas
  const limited = rateLimitOrNull(req, { key: 'register', limit: 5, windowMs: 15 * 60 * 1000 })
  if (limited) return limited

  try {
    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    if (sanitizedData.phone) {
      const phone = String(sanitizedData.phone).trim()
      if (!/^[+\d\s().-]+$/.test(phone)) {
        return errorResponse('Telefone inválido')
      }
      const digits = phone.replace(/\D/g, '')
      sanitizedData.phone = phone.startsWith('+') ? `+${digits}` : digits
    }

    // Validações
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.password) {
      return errorResponse('Nome, email e senha são obrigatórios');
    }

    if (!isValidEmail(sanitizedData.email)) {
      return errorResponse('Email inválido');
    }

    if (!isPasswordStrong(sanitizedData.password)) {
      return errorResponse(PASSWORD_POLICY_MESSAGE);
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email: sanitizedData.email });
    if (existingUser) {
      return errorResponse('Email já está em uso');
    }


    // Segurança: este endpoint é público (auto-registo). NUNCA confiar no valor de
    // "role" enviado pelo cliente — caso contrário qualquer pessoa poderia enviar
    // { role: "admin" } no corpo do pedido e criar uma conta de administrador.
    // Apenas 'member' e 'visitor' podem resultar de um auto-registo; contas 'admin'
    // só podem ser criadas por um administrador autenticado (ver /api/admin/users).
    let role: 'member' | 'visitor' = 'visitor'
    if (sanitizedData.role === 'member') {
      role = 'member'
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
      isActive: true, // sempre true no auto-registo; não confiar em valor do cliente
      preferences: {
        newsletter: true,
        emailNotifications: true
      }
    };

    const user = new User(userData);
    await user.save();

    try { await syncNewsletterPreference(sanitizedData.email, true) } catch {}

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
