import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/api-utils';
import prisma from '@/lib/prisma'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const images = await (prisma as any).image.findMany({ orderBy: { createdAt: 'desc' } })
    
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

    const all = await (prisma as any).image.findMany({ select: { id: true, path: true } })
    let deletedCount = 0
    let failedCount = 0
    for (const it of all) {
      try { await fs.promises.unlink(it.path); deletedCount++ } catch { failedCount++ }
    }
    await (prisma as any).image.deleteMany()
    return NextResponse.json({ success: true, data: { deletedCount, failedCount } });
  } catch (error) {
    console.error('Erro ao deletar todas as imagens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
