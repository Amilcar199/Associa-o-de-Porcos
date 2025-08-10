export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

    // Criptografar nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(sanitizedData.password, saltRounds);

    // Atualizar senha e limpar token
    user.password = hashedPassword;
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

