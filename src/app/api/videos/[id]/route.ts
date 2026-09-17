export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { getVideo, deleteVideo } from '@/lib/gridfs';
import { authMiddleware } from '@/lib/api-utils';

function parseRange(rangeHeader: string | null, size: number): { start: number; end: number } | null {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null
  const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-')
  const start = startStr ? parseInt(startStr, 10) : 0
  const end = endStr ? parseInt(endStr, 10) : size - 1
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start < 0 || end >= size) return null
  return { start, end }
}

// GET /api/videos/[id] - Servir o vídeo guardado no GridFS.
//
// NOTA IMPORTANTE: esta rota estava em falta (a pasta [id] existia mas vazia).
// Todos os vídeos do site (produtos, notícias, conteúdo de membros) apontam
// para /api/videos/{id}, mas sem este ficheiro o Next.js devolvia 404 para
// qualquer pedido — por isso NENHUM vídeo carregava em lado nenhum do site.
//
// O suporte a "Range" (pedidos por intervalo de bytes) é essencial para
// vídeo: sem ele, o browser não consegue avançar/recuar na barra de
// progresso e, em vários browsers (Safari/iOS em particular), o vídeo
// nem sequer começa a reproduzir.
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Precisamos do tamanho do ficheiro antes de decidir se há Range.
    const probe = await getVideo(id);
    if (!probe) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }

    const rangeHeader = request.headers.get('range')
    const range = parseRange(rangeHeader, probe.length)

    // Se foi pedido um intervalo, é preciso reabrir a stream já posicionada
    // nesse intervalo (a stream da "probe" acima já começou a abrir desde
    // o byte 0, por isso não pode ser reaproveitada).
    const video = range ? await getVideo(id, range) : probe;
    if (!video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }

    // `video.stream` é uma Readable stream do Node.js (driver MongoDB/GridFS).
    // A Web API `Response`/`NextResponse` exige uma ReadableStream do tipo
    // Web Streams — por isso é preciso converter com Readable.toWeb().
    const webStream = Readable.toWeb(video.stream as Readable) as unknown as ReadableStream;

    const headers: Record<string, string> = {
      'Content-Type': video.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': 'bytes',
    };

    if (range) {
      headers['Content-Range'] = `bytes ${range.start}-${range.end}/${video.length}`
      headers['Content-Length'] = String(range.end - range.start + 1)
      return new NextResponse(webStream, { status: 206, headers });
    }

    headers['Content-Length'] = String(video.length)
    return new NextResponse(webStream, { status: 200, headers });
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[id] - Remover um vídeo do GridFS (apenas autenticado)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const success = await deleteVideo(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar vídeo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vídeo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
