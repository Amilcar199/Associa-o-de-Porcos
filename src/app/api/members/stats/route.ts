import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse('Não autorizado', 401);
    }

    if (session.user.role === 'visitor') {
      return errorResponse('Acesso negado. Apenas membros podem acessar este conteúdo.', 403);
    }

    const memberStats = {
      totalDocuments: 25,
      totalVideos: 12,
      totalEvents: 8,
      membershipLevel: session.user.role === 'admin' ? 'Administrador' : 'Membro'
    };

    return NextResponse.json(successResponse(memberStats));
  } catch (error) {
    console.error('Erro ao buscar estatísticas de membros:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}
