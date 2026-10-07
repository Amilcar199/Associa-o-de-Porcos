export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';
import { hashResetToken } from '@/lib/password'
import { rateLimitOrNull } from '@/lib/rate-limit'

// POST /api/auth/validate-reset-token - Validar token de reset
export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'validate-reset-token', limit: 20, windowMs: 15 * 60 * 1000 })
  if (limited) return limited

  try {
    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    if (!sanitizedData.token) {
      return errorResponse('Token é obrigatório');
    }

    // Buscar usuário com o token
    const user = await User.findOne({
      passwordResetToken: hashResetToken(String(sanitizedData.token)),
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

