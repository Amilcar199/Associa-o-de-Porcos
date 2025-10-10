export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma'
import { saveBufferToDisk, deleteFromDisk } from '@/lib/storage'

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
    
    // Salvar no disco e registrar no Prisma
    const saved = await saveBufferToDisk(buffer, file.name, file.type)
    const img = await (prisma as any).image.create({
      data: {
        filename: saved.filename,
        contentType: saved.contentType,
        size: saved.size,
        category: category || null,
        url: saved.publicUrl,
        path: saved.filepath,
        uploadedById: session.user.id
      }
    })

    // Se replaceId foi informado, deletar a antiga (tenta Prisma; fallback GridFS)
    if (replaceId) {
      try {
        const old = await (prisma as any).image.findUnique({ where: { id: replaceId } })
        if (old) {
          await deleteFromDisk(old.path)
          await (prisma as any).image.delete({ where: { id: replaceId } })
        } else {
          const { deleteImage } = await import('@/lib/gridfs')
          await deleteImage(replaceId)
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId: img.id,
        filename: img.filename,
        contentType: img.contentType,
        size: img.size,
        url: img.url,
        category: img.category || undefined
      }
    });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
