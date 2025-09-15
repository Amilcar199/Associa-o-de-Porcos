export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getImage, deleteImage } from '@/lib/gridfs';
import connectDB from '@/lib/mongodb';
import LegalSection from '@/models/LegalContent';
import { authMiddleware } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const image = await getImage(id);

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      );
    }

    // Retornar a imagem como stream
    return new NextResponse(image.stream, {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 ano
      },
    });
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const success = await deleteImage(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar imagem' },
        { status: 500 }
      );
    }

    // Remover referências no modelo LegalSection (itens com url igual ao arquivo removido)
    try {
      await connectDB();
      const url = `/api/images/${id}`;
      await (LegalSection as any).updateMany({}, { $pull: { items: { url } } });
    } catch (e) {
      console.error('Falha ao limpar referências em LegalSection:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Imagem deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
