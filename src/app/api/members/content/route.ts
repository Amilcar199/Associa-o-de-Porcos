import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';

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

    // Mock data para demonstração - em produção viria do banco de dados
    const memberContent = [
      {
        id: '1',
        title: 'Manual de Boas Práticas na Criação de Porcos',
        description: 'Guia completo com as melhores práticas para criação sustentável e eficiente.',
        type: 'document',
        category: 'Técnico',
        url: '/documents/manual-boas-praticas.pdf',
        thumbnail: '/images/manual-thumb.jpg',
        createdAt: '2024-01-15T10:00:00Z',
        isFeatured: true
      },
      {
        id: '2',
        title: 'Webinar: Nutrição Avançada para Suínos',
        description: 'Palestra sobre nutrição especializada e suplementação para diferentes fases.',
        type: 'video',
        category: 'Educacional',
        url: 'https://youtube.com/watch?v=example',
        thumbnail: '/images/webinar-thumb.jpg',
        createdAt: '2024-01-10T14:30:00Z',
        isFeatured: true
      },
      {
        id: '3',
        title: 'Tendências do Mercado Suíno 2024',
        description: 'Análise completa das tendências e oportunidades no mercado angolano.',
        type: 'article',
        category: 'Mercado',
        url: '/articles/tendencias-mercado-2024',
        thumbnail: '/images/mercado-thumb.jpg',
        createdAt: '2024-01-08T09:15:00Z',
        isFeatured: false
      },
      {
        id: '4',
        title: 'Workshop de Sanidade Animal',
        description: 'Evento presencial sobre prevenção de doenças e biosseguridade.',
        type: 'event',
        category: 'Evento',
        url: '/events/workshop-sanidade',
        thumbnail: '/images/workshop-thumb.jpg',
        createdAt: '2024-01-05T16:00:00Z',
        isFeatured: true
      },
      {
        id: '5',
        title: 'Protocolo de Vacinação Completo',
        description: 'Documento detalhado com todos os protocolos de vacinação recomendados.',
        type: 'document',
        category: 'Saúde',
        url: '/documents/protocolo-vacinacao.pdf',
        thumbnail: '/images/vacinacao-thumb.jpg',
        createdAt: '2024-01-03T11:20:00Z',
        isFeatured: false
      },
      {
        id: '6',
        title: 'Técnicas de Melhoramento Genético',
        description: 'Vídeo explicativo sobre seleção e melhoramento genético em suínos.',
        type: 'video',
        category: 'Técnico',
        url: 'https://youtube.com/watch?v=genetica',
        thumbnail: '/images/genetica-thumb.jpg',
        createdAt: '2024-01-01T13:45:00Z',
        isFeatured: false
      }
    ];

    return NextResponse.json(successResponse(memberContent));
  } catch (error) {
    console.error('Erro ao buscar conteúdo de membros:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}
