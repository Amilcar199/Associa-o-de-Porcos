import connectDB from '@/lib/mongodb'
import InAppNotification from '@/models/InAppNotification'
import PushSubscription from '@/models/PushSubscription'
import webpush from '@/lib/webpush'

type Notice = { title: string; body: string; href: string }

export async function notifyUsers(userIds: Array<string | undefined>, notice: Notice) {
  const ids = Array.from(new Set(userIds.filter((id): id is string => Boolean(id))))
  if (ids.length === 0) return

  await connectDB()
  await InAppNotification.insertMany(ids.map((user) => ({
    user,
    title: notice.title.slice(0, 140),
    body: notice.body.slice(0, 400),
    href: notice.href,
    read: false,
  })))

  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey || !process.env.VAPID_PRIVATE_KEY) return

  const subs = await PushSubscription.find({ userId: { $in: ids } }).lean()
  const payload = JSON.stringify({ title: notice.title, body: notice.body, data: { url: notice.href } })
  await Promise.allSettled(subs.map(async (sub) => {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys } as any, payload)
    } catch (error: any) {
      const statusCode = error?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        await PushSubscription.deleteOne({ endpoint: sub.endpoint })
      }
    }
  }))
}

export function hasProPlan(user: { plan?: string; planExpiresAt?: Date | string | null } | null) {
  if (!user || user.plan !== 'pro') return false
  if (!user.planExpiresAt) return true
  return new Date(user.planExpiresAt).getTime() > Date.now()
}
