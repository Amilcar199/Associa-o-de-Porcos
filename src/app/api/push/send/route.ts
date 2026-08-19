import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import PushSubscription from '@/models/PushSubscription'
import webpush from '@/lib/webpush'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
    }

    const { title, body, data } = await request.json()
    await connectDB()

    const subs = await PushSubscription.find({}).lean()
    const payload = JSON.stringify({ title: title || 'Notificação', body: body || 'Mensagem', data: data || {} })

    const results = await Promise.allSettled(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys } as any, payload)
          return { endpoint: s.endpoint, ok: true }
        } catch (err: any) {
          const statusCode = err?.statusCode || err?.statusCode === 0 ? err.statusCode : err?.body?.statusCode
          if (statusCode === 404 || statusCode === 410) {
            await PushSubscription.deleteOne({ endpoint: s.endpoint })
          }
          return { endpoint: s.endpoint, ok: false }
        }
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled' && (r as any).value.ok).length
    const failed = subs.length - sent
    return NextResponse.json({ ok: true, sent, failed })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}

