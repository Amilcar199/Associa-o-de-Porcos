export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils';
import ActivityLog from '@/models/ActivityLog';
import { syncNewsletterPreference } from '@/lib/notifications'

function textOrEmpty(value: unknown, max: number) {
  if (typeof value !== 'string') return undefined
  return value.trim().slice(0, max)
}

function pickProfileUpdate(input: Record<string, any>) {
  const update: Record<string, unknown> = {}
  const name = textOrEmpty(input.name, 100)
  if (name) update.name = name
  const phone = textOrEmpty(input.phone, 20)
  if (phone) update.phone = phone
  const company = textOrEmpty(input.company, 100)
  if (company !== undefined) update.company = company
  const bio = textOrEmpty(input.bio, 500)
  if (bio !== undefined) update.bio = bio
  const location = textOrEmpty(input.location, 100)
  if (location !== undefined) update.location = location
  const specialty = textOrEmpty(input.specialty, 120)
  if (specialty !== undefined) update.specialty = specialty
  const website = textOrEmpty(input.website, 200)
  if (website) update.website = website
  const avatar = textOrEmpty(input.avatar, 300)
  if (avatar) update.avatar = avatar

  if (input.socialMedia && typeof input.socialMedia === 'object') {
    const social: Record<string, string> = {}
    for (const key of ['linkedin', 'twitter', 'facebook'] as const) {
      const url = textOrEmpty(input.socialMedia[key], 200)
      if (url) social[key] = url
    }
    if (Object.keys(social).length) update.socialMedia = social
  }

  if (input.preferences && typeof input.preferences === 'object') {
    update.preferences = {
      emailNotifications: Boolean(input.preferences.emailNotifications),
      smsNotifications: Boolean(input.preferences.smsNotifications),
      newsletter: Boolean(input.preferences.newsletter),
    }
  }

  return update
}

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

    const profileUpdate = pickProfileUpdate(sanitizedData);
    if (Object.keys(profileUpdate).length === 0) {
      return errorResponse('Nenhum campo válido para actualizar');
    }

    // Atualizar usuário
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: profileUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return errorResponse('Usuário não encontrado', 404);
    }

    if (typeof (profileUpdate.preferences as { newsletter?: boolean } | undefined)?.newsletter === 'boolean') {
      try { await syncNewsletterPreference(updatedUser.email, (profileUpdate.preferences as { newsletter: boolean }).newsletter) } catch {}
    }

    try {
      await ActivityLog.create({
        user: session.user.id,
        type: 'profile_update',
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        metadata: Object.keys(profileUpdate)
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
