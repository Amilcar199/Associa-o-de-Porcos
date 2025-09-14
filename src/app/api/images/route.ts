import { NextRequest, NextResponse } from 'next/server';
import { listImages, deleteAllImages } from '@/lib/gridfs';
import { authMiddleware } from '@/lib/api-utils';

export const dynamic = 'force-dynamic'

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

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { deletedCount, failedCount } = await deleteAllImages();
    return NextResponse.json({ success: true, data: { deletedCount, failedCount } });
  } catch (error) {
    console.error('Erro ao deletar todas as imagens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
