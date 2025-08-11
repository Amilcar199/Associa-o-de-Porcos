export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';

// GET /api/user/profile - Buscar perfil do usuário logado
export async function GET(req: NextRequest) {
  try {
    const TEMP_BYPASS_MEMBER_AUTH = true

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      if (TEMP_BYPASS_MEMBER_AUTH) {
        const mockUser = {
          _id: 'mock-user-id',
          name: 'Membro Demo',
          email: 'demo@usuario.local',
          role: 'member',
          avatar: undefined,
          phone: '',
          company: '',
          bio: '',
          location: '',
          website: '',
          socialMedia: {},
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            newsletter: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return NextResponse.json(successResponse(mockUser))
      }
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
    const TEMP_BYPASS_MEMBER_AUTH = true

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      if (TEMP_BYPASS_MEMBER_AUTH) {
        // Em modo bypass, aceitar atualização e retornar mock atualizado superficialmente
        const body = await req.json();
        const sanitizedData = sanitizeInput(body);
        const updatedMock = {
          _id: 'mock-user-id',
          name: sanitizedData.name || 'Membro Demo',
          email: 'demo@usuario.local',
          role: 'member',
          avatar: sanitizedData.avatar,
          phone: sanitizedData.phone || '',
          company: sanitizedData.company || '',
          bio: sanitizedData.bio || '',
          location: sanitizedData.location || '',
          website: sanitizedData.website || '',
          socialMedia: sanitizedData.socialMedia || {},
          preferences: sanitizedData.preferences || { emailNotifications: true, smsNotifications: false, newsletter: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return NextResponse.json(successResponse(updatedMock, 'Perfil atualizado (bypass)'))
      }
      return errorResponse('Não autorizado', 401);
    }

    await connectDB();

    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

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
