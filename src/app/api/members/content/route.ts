import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic'

// GET /api/members/content - Buscar conteúdo exclusivo para membros
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Não autorizado', 401);
    }

    // Verificar se o usuário é membro ou admin
    if (session.user.role === 'visitor') {
      return errorResponse('Acesso negado. Apenas membros podem acessar este conteúdo.', 403);
    }

    // Buscar conteúdo ativo do banco de dados
    const memberContent = await prisma.memberContent.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        category: true,
        url: true,
        thumbnail: true,
        content: true,
        fileUrl: true,
        videoUrl: true,
        isFeatured: true,
        isActive: true,
        tags: true,
        views: true,
        downloads: true,
        createdAt: true,
        author: { select: { name: true } }
      }
    });

    // Se não há conteúdo, retornar array vazio
    if (!memberContent || memberContent.length === 0) {
      return NextResponse.json(successResponse([], 'Nenhum conteúdo disponível'));
    }

    return NextResponse.json(successResponse(memberContent as any));
  } catch (error) {
    console.error('Erro ao buscar conteúdo de membros:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}
