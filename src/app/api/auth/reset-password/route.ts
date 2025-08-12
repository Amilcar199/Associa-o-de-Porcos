export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';

// POST /api/auth/reset-password - Redefinir senha
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    if (!sanitizedData.token || !sanitizedData.password) {
      return errorResponse('Token e nova senha são obrigatórios');
    }

    if (sanitizedData.password.length < 6) {
      return errorResponse('Senha deve ter pelo menos 6 caracteres');
    }

    // Buscar usuário com o token
    const user = await User.findOne({
      passwordResetToken: sanitizedData.token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return errorResponse('Token inválido ou expirado');
    }

    // Atualizar senha (hash será aplicado no pre-save do modelo)
    user.password = sanitizedData.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return NextResponse.json(
      successResponse({}, 'Senha redefinida com sucesso')
    );
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}

