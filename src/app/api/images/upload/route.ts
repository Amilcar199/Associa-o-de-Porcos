export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/gridfs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (qualquer usuário logado pode enviar avatar)
    const session: any = await getServerSession(authOptions as any);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

    // Verificar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use apenas imagens (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      );
    }

    // Converter arquivo para Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Fazer upload da imagem (com metadados)
    const result = await uploadImage(buffer, file.name, file.type, { category });

    // Se replaceId foi informado, deletar a antiga
    if (replaceId) {
      try {
        const { deleteImage } = await import('@/lib/gridfs')
        await deleteImage(replaceId)
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
