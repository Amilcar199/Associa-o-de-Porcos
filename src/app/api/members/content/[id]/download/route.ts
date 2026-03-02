import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role === 'visitor') {
      return NextResponse.json({ success: false }, { status: 204 })
    }

    const { id } = params
    if (!id) return NextResponse.json({ success: false }, { status: 400 })
    await prisma.memberContent.update({ where: { id }, data: { downloads: { increment: 1 } } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

