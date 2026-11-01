export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { rateLimitOrNull } from '@/lib/rate-limit'
import { expressReadiness, verifyExpressWebhook } from '@/lib/express-gateway'

export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'express-webhook', limit: 60, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  const readiness = expressReadiness()
  if (readiness.state === 'awaiting_credentials') {
    return NextResponse.json({ success: false, error: 'Gateway Express ainda não está ligado.' }, { status: 503 })
  }

  const raw = await req.text()
  const signature = req.headers.get('x-express-signature')
  if (!verifyExpressWebhook(raw, signature)) {
    return NextResponse.json({ success: false, error: 'O webhook do Express ainda não confirma pagamentos.' }, { status: 501 })
  }

  return NextResponse.json({ success: false, error: 'Confirmação por webhook ainda não está ligada.' }, { status: 501 })
}
