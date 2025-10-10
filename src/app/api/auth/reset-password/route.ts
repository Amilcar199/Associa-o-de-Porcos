export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';
import { isPasswordStrong } from '@/lib/password'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/auth/reset-password - Redefinir senha
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    // Novo fluxo: email + respostas de segurança, sem token
    if (!sanitizedData.email || !sanitizedData.password) {
      return errorResponse('Email e nova senha são obrigatórios')
    }

    if (!isPasswordStrong(sanitizedData.password)) {
      return errorResponse('Senha fraca: mínimo 6 caracteres, ao menos um número e sem sequências numéricas (ex.: 123, 321)');
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedData.email.toLowerCase() } })

    if (!user || user.isActive === false) {
      return errorResponse('Conta não encontrada ou inativa')
    }

    // Valida respostas simples, se enviadas
    const answers = sanitizedData.answers || {}
    let score = 0
    if (answers.phone_last2) {
      const digits = (user.phone || '').toString().replace(/\D/g, '')
      if (digits && answers.phone_last2 === digits.slice(-2)) score++
    }
    if (answers.company_exact) {
      const company = (user.company || '').toString().trim().toLowerCase()
      if (company && company === String(answers.company_exact).trim().toLowerCase()) score++
    }
    if (score === 0) {
      return errorResponse('Respostas incorretas')
    }

    // Atualizar senha
    const passwordHash = await bcrypt.hash(sanitizedData.password, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } })

    return NextResponse.json(
      successResponse({}, 'Senha redefinida com sucesso')
    );
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}

