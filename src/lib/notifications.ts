import User from '@/models/User'
import NewsletterSubscriber from '@/models/NewsletterSubscriber'

export async function userAcceptsEmail(userId: string): Promise<boolean> {
  const user = await User.findById(userId).select('preferences').lean()
  if (!user) return false
  const prefs = (user as { preferences?: { emailNotifications?: boolean } }).preferences
  return prefs?.emailNotifications !== false
}

export async function userAcceptsNewsletter(userId: string): Promise<boolean> {
  const user = await User.findById(userId).select('preferences').lean()
  if (!user) return false
  const prefs = (user as { preferences?: { newsletter?: boolean } }).preferences
  return prefs?.newsletter !== false
}

export async function syncNewsletterPreference(email: string, subscribed: boolean) {
  if (!email) return
  const normalized = email.toLowerCase().trim()
  if (subscribed) {
    await NewsletterSubscriber.findOneAndUpdate(
      { email: normalized },
      { email: normalized, active: true, unsubscribedAt: null, source: 'profile' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  } else {
    await NewsletterSubscriber.findOneAndUpdate(
      { email: normalized },
      { active: false, unsubscribedAt: new Date() }
    )
  }
}

export async function collectNewsletterEmails(): Promise<string[]> {
  const [subscribers, users] = await Promise.all([
    NewsletterSubscriber.find({ active: true }).select('email').lean(),
    User.find({ 'preferences.newsletter': { $ne: false }, isActive: { $ne: false } }).select('email').lean(),
  ])

  const set = new Set<string>()
  for (const row of subscribers) {
    if (row.email) set.add(String(row.email).toLowerCase())
  }
  for (const row of users) {
    const email = (row as unknown as { email?: string }).email
    if (email) set.add(String(email).toLowerCase())
  }
  return Array.from(set)
}
