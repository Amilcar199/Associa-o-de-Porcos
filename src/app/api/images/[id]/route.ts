export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/api-utils';
import prisma from '@/lib/prisma'
import fs from 'fs'
import { getImage, deleteImage } from '@/lib/gridfs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // Primeiro tenta via Prisma/disk
    const rec = await (prisma as any).image.findUnique({ where: { id } })
    if (rec) {
      const fileStream = fs.createReadStream(rec.path)
      return new NextResponse(fileStream as any, {
        headers: {
          'Content-Type': rec.contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // Fallback GridFS
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
    let success = false
    const rec = await (prisma as any).image.findUnique({ where: { id } })
    if (rec) {
      try { await fs.promises.unlink(rec.path) } catch {}
      await (prisma as any).image.delete({ where: { id } })
      success = true
    } else {
      success = await deleteImage(id)
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar imagem' },
        { status: 500 }
      );
    }

    // Remover referências antigas em LegalSection (Mongo) deixado de fora por ora;
    // as novas URLs de imagem agora apontam para `public/uploads/images/*`.

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
