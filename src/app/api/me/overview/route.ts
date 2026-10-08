export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Farm from '@/models/Farm'
import Product from '@/models/Product'
import Contact from '@/models/Contact'
import ActivityLog from '@/models/ActivityLog'
import MemberContent from '@/models/MemberContent'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!session?.user || !userId) return errorResponse('Não autorizado', 401)

    await connectDB()
    const user = await User.findById(userId).select('name email phone company bio location specialty role preferences')
    if (!user) return errorResponse('Usuário não encontrado', 404)

    const [farms, animals, contacts, requests, contentCount] = await Promise.all([
      Farm.find({ owner: userId, isActive: true }).sort({ updatedAt: -1 }).limit(20).lean(),
      Product.find({ seller: userId, isActive: true })
        .select('name breed age weight availability price location images')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),
      Contact.find({ email: user.email }).select('subject status createdAt').sort({ createdAt: -1 }).limit(10).lean(),
      ActivityLog.find({ user: userId, type: 'membership_request' }).select('createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      user.role === 'visitor' ? Promise.resolve(0) : MemberContent.countDocuments({ isActive: true }),
    ])

    return NextResponse.json(successResponse({
      profile: user,
      farms,
      animals,
      contacts,
      requests,
      contentCount,
    }))
  } catch (error) {
    console.error('Erro no painel do produtor:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
