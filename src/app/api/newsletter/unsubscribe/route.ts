export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import NewsletterSubscriber from '@/models/NewsletterSubscriber'
import { isValidEmail } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || ''
  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
  }

  await connectDB()
  await NewsletterSubscriber.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { active: false, unsubscribedAt: new Date() }
  )

  return NextResponse.json({ success: true, message: 'Inscrição cancelada' })
}
