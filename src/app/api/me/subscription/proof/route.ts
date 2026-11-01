export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/api-utils'
import { rateLimitOrNull } from '@/lib/rate-limit'
import { deleteReceipt, uploadReceipt } from '@/lib/receipts'
import { SubscriptionError } from '@/lib/subscriptions'
import { attachProof } from '@/lib/subscription-service'

const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])

export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'subscription-proof', limit: 15, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    const userId = (session as { user?: { id?: string } } | null)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)

    const form = await req.formData()
    const transactionId = String(form.get('transactionId') || '')
    const note = String(form.get('note') || '').trim().slice(0, 300)
    const file = form.get('file')
    if (!/^[a-f\d]{24}$/i.test(transactionId)) return errorResponse('Transacção inválida')
    if (!(file instanceof File)) return errorResponse('Envie o comprovativo')
    if (!ALLOWED.has(file.type)) return errorResponse('Use uma imagem ou um PDF')
    if (file.size > 5 * 1024 * 1024) return errorResponse('O comprovativo pode ter no máximo 5MB')

    const saved = await uploadReceipt(Buffer.from(await file.arrayBuffer()), file.name, file.type, String(userId))
    try {
      const transaction = await attachProof(String(userId), transactionId, saved.fileId, note)
      return NextResponse.json(successResponse(transaction, 'Comprovativo enviado'))
    } catch (error) {
      await deleteReceipt(saved.fileId)
      throw error
    }
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao guardar comprovativo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
