import { NextRequest, NextResponse } from 'next/server';
import { listImages } from '@/lib/gridfs';
import { authMiddleware } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const images = await listImages();
    
    return NextResponse.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
