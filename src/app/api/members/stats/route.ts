import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import MemberContent from '@/models/MemberContent';
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

    // Buscar estatísticas reais do banco de dados
    const [totalDocuments, totalVideos, totalEvents, totalArticles] = await Promise.all([
      MemberContent.countDocuments({ type: 'document', isActive: true }).catch(() => 0),
      MemberContent.countDocuments({ type: 'video', isActive: true }).catch(() => 0),
      MemberContent.countDocuments({ type: 'event', isActive: true }).catch(() => 0),
      MemberContent.countDocuments({ type: 'article', isActive: true }).catch(() => 0)
    ]);

    const memberStats = {
      totalDocuments,
      totalVideos,
      totalEvents,
      totalArticles,
      membershipLevel: session.user.role === 'admin' ? 'Administrador' : 'Membro'
    };

    return NextResponse.json(successResponse(memberStats));
  } catch (error) {
    console.error('Erro ao buscar estatísticas de membros:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}
