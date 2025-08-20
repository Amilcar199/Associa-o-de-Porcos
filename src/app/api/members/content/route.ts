import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';
import MemberContent from '@/models/MemberContent';

export const dynamic = 'force-dynamic'

// GET /api/members/content - Buscar conteúdo exclusivo para membros
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Não autorizado', 401);
    }

    // Verificar se o usuário é membro ou admin
    if (session.user.role === 'visitor') {
      return errorResponse('Acesso negado. Apenas membros podem acessar este conteúdo.', 403);
    }

    // Buscar conteúdo ativo do banco de dados
    const memberContent = await (MemberContent as any).findActive()
      .populate('author', 'name')
      .lean();

    // Se não há conteúdo, retornar array vazio
    if (!memberContent || memberContent.length === 0) {
      return NextResponse.json(successResponse([], 'Nenhum conteúdo disponível'));
    }

    return NextResponse.json(successResponse(memberContent));
  } catch (error) {
    console.error('Erro ao buscar conteúdo de membros:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}
