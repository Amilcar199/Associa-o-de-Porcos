export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';

// POST /api/auth/validate-reset-token - Validar token de reset
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    if (!sanitizedData.token) {
      return errorResponse('Token é obrigatório');
    }

    // Buscar usuário com o token
    const user = await User.findOne({
      passwordResetToken: sanitizedData.token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return errorResponse('Token inválido ou expirado');
    }

    return NextResponse.json(
      successResponse({ valid: true }, 'Token válido')
    );
  } catch (error: any) {
    console.error('Erro ao validar token:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}

