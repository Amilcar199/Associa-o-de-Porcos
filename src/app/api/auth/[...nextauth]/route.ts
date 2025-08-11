import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export const GET = async (...args: any[]) => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('Por favor, adicione sua NEXTAUTH_SECRET no arquivo .env.local')
  }
  return handler(...(args as any))
}

export const POST = GET
