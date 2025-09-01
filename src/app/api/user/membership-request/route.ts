import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ActivityLog from '@/models/ActivityLog'
import User from '@/models/User'
import { errorResponse, successResponse } from '@/lib/api-utils'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return errorResponse('Não autorizado', 401)
    }

    const currentUser = await User.findById(session.user.id)
    if (!currentUser) return errorResponse('Usuário não encontrado', 404)

    if (currentUser.role === 'member' || currentUser.role === 'admin') {
      return errorResponse('Usuário já possui acesso de membro', 400)
    }

    await ActivityLog.create({
      user: currentUser._id,
      type: 'membership_request',
      metadata: { email: currentUser.email, name: currentUser.name }
    })

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_SERVER_USER || process.env.SMTP_USER
    if (adminEmail) {
      const html = `
        <p>Nova solicitação de associação:</p>
        <p><strong>Nome:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Empresa:</strong> ${currentUser.company || '-'}</p>
        <p><strong>Bio/Descrição:</strong> ${currentUser.bio || '-'}</p>
        <p><a href="${process.env.NEXTAUTH_URL}/admin/usuarios" target="_blank">Gerenciar usuários</a></p>
      `
      await sendEmail({ to: adminEmail, subject: 'Solicitação de Associação', html })
    }

    return NextResponse.json(successResponse({}, 'Solicitação enviada'))
  } catch (e) {
    console.error('Erro ao criar solicitação de associação:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

