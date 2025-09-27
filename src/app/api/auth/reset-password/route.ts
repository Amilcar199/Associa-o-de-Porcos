export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';
import { isPasswordStrong } from '@/lib/password'

// POST /api/auth/reset-password - Redefinir senha
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    if ((!sanitizedData.token && !sanitizedData.otp) || !sanitizedData.password) {
      return errorResponse('Token/OTP e nova senha são obrigatórios');
    }

    if (!isPasswordStrong(sanitizedData.password)) {
      return errorResponse('Senha fraca: mínimo 6 caracteres, ao menos um número e sem sequências numéricas (ex.: 123, 321)');
    }

    let user = null as any
    if (sanitizedData.token) {
      user = await User.findOne({
        passwordResetToken: sanitizedData.token,
        passwordResetExpires: { $gt: new Date() }
      })
    } else if (sanitizedData.otp && sanitizedData.email) {
      user = await User.findOne({
        email: sanitizedData.email.toLowerCase(),
        otpCode: sanitizedData.otp,
        otpExpires: { $gt: new Date() }
      })
    }

    if (!user) {
      return errorResponse('Token inválido ou expirado');
    }

    // Atualizar senha (hash será aplicado no pre-save do modelo)
    user.password = sanitizedData.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json(
      successResponse({}, 'Senha redefinida com sucesso')
    );
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}

