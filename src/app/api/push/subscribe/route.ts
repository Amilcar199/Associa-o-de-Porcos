import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PushSubscription from '@/models/PushSubscription'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    await connectDB()
    const session: any = await getServerSession(authOptions as any)
    const userId = session?.user?.id || null
    const { subscription } = await request.json()
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime ?? null,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userId
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

