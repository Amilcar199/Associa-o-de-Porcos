export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';
import { isPasswordStrong, PASSWORD_POLICY_MESSAGE } from '@/lib/password'
import { rateLimitOrNull } from '@/lib/rate-limit'

// POST /api/auth/reset-password - Redefinir senha
export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'reset-password', limit: 10, windowMs: 15 * 60 * 1000 })
  if (limited) return limited

  try {
    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    // Fluxo seguro: exige token válido enviado por email (gerado em /api/auth/forgot-password)
    if (!sanitizedData.token || !sanitizedData.password) {
      return errorResponse('Token e nova senha são obrigatórios')
    }

    if (!isPasswordStrong(sanitizedData.password)) {
      return errorResponse(PASSWORD_POLICY_MESSAGE);
    }

    const user = await User.findOne({
      passwordResetToken: sanitizedData.token,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    })

    if (!user) {
      return errorResponse('Token inválido ou expirado. Solicite uma nova recuperação de senha.')
    }

    // Atualizar senha (hash será aplicado no pre-save do modelo)
    user.password = sanitizedData.password;
    // Invalidar o token para que não possa ser reutilizado
    user.clearPasswordResetToken();
    await user.save();

    return NextResponse.json(
      successResponse({}, 'Senha redefinida com sucesso')
    );
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}

