export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma'

// GET /api/user/profile - Buscar perfil do usuário logado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Não autorizado', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        company: true,
        bio: true,
        location: true,
        website: true,
        socialMedia: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
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

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    // Continuar sem exigir verificação de email

    // Remover campos que não devem ser alterados pelo usuário
    delete sanitizedData.email;
    delete sanitizedData.role;
    delete sanitizedData.password;

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: sanitizedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        company: true,
        bio: true,
        location: true,
        website: true,
        socialMedia: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!updatedUser) {
      return errorResponse('Usuário não encontrado', 404);
    }

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          type: 'profile_update',
          ip: req.headers.get('x-forwarded-for') || undefined || null,
          userAgent: req.headers.get('user-agent') || undefined || null,
          metadata: Object.keys(sanitizedData)
        }
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
