export const dynamic = 'force-dynamic'

import { Readable } from 'stream'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openReceipt } from '@/lib/receipts'
import { userCanReadReceipt } from '@/lib/subscription-service'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; role?: string } | undefined
    if (!user?.id) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    if (!/^[a-f\d]{24}$/i.test(params.id)) return NextResponse.json({ success: false, error: 'Comprovativo inválido' }, { status: 400 })

    const allowed = await userCanReadReceipt(user.id, user.role || '', params.id)
    if (!allowed) return NextResponse.json({ success: false, error: 'Comprovativo não encontrado' }, { status: 404 })

    const receipt = await openReceipt(params.id)
    if (!receipt) return NextResponse.json({ success: false, error: 'Comprovativo não encontrado' }, { status: 404 })

    const webStream = Readable.toWeb(receipt.stream as Readable) as unknown as ReadableStream
    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': receipt.contentType,
        'Content-Length': String(receipt.length),
        'Content-Disposition': 'inline; filename="comprovativo"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Erro ao abrir comprovativo:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
