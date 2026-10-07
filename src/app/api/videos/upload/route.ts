export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { uploadVideo, deleteVideo } from '@/lib/gridfs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimitOrNull } from '@/lib/rate-limit';

// Mantém uma proteção de tamanho no servidor sem aplicar o limite específico
// de funções serverless da Vercel. O Railway suporta uploads maiores; o limite
// da aplicação continua a evitar consumo acidental excessivo de memória.
const MAX_VIDEO_SIZE_BYTES = 80 * 1024 * 1024; // 80MB

export async function POST(request: NextRequest) {
  const limited = rateLimitOrNull(request, { key: 'video-upload', limit: 5, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem enviar vídeos' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || ''
    const replaceId = (formData.get('replaceId') as string) || ''

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use apenas vídeos (MP4, WebM, OGG, MOV)' },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        {
          error:
            `Arquivo muito grande. Tamanho máximo: ${Math.round(MAX_VIDEO_SIZE_BYTES / 1024 / 1024)}MB. ` +
            'Para vídeos maiores, use o campo "Adicionar URL" com um link do YouTube ou Vimeo.',
        },
        { status: 400 }
      );
    }

    if (replaceId && session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem substituir ficheiros existentes' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadVideo(buffer, file.name, file.type, { category });

    if (replaceId) {
      try {
        const deleted = await deleteVideo(replaceId);
        if (!deleted) {
          console.warn('Não foi possível remover o vídeo substituído:', replaceId);
        }
      } catch (error) {
        console.warn('Erro ao remover o vídeo substituído:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro no upload de vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
