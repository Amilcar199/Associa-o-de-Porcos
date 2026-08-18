export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';
import ActivityLog from '@/models/ActivityLog';
import { syncNewsletterPreference } from '@/lib/notifications'

// GET /api/user/profile - Buscar perfil do usuário logado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Não autorizado', 401);
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return errorResponse('Usuário não encontrado', 404);
    }

    return NextResponse.json(successResponse(user));
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}

// PUT /api/user/profile - Atualizar perfil do usuário logado
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Não autorizado', 401);
    }

    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    // Continuar sem exigir verificação de email

    // Remover campos que não devem ser alterados pelo usuário
    delete sanitizedData.email;
    delete sanitizedData.role;
    delete sanitizedData.password;

    // Atualizar usuário
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return errorResponse('Usuário não encontrado', 404);
    }

    if (typeof sanitizedData?.preferences?.newsletter === 'boolean') {
      try { await syncNewsletterPreference(updatedUser.email, sanitizedData.preferences.newsletter) } catch {}
    }

    try {
      await ActivityLog.create({
        user: session.user.id,
        type: 'profile_update',
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        metadata: Object.keys(sanitizedData)
      })
    } catch {}

    return NextResponse.json(
      successResponse(updatedUser, 'Perfil atualizado com sucesso')
    );
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return errorResponse(`Erro de validação: ${errors.join(', ')}`);
    }
    
    return errorResponse('Erro interno do servidor', 500);
  }
}
