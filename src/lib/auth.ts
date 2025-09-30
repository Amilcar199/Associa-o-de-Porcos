import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { AuthUser } from '@/types'
import GoogleProvider from 'next-auth/providers/google'

const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'seu@email.com'
        },
        password: {
          label: 'Senha',
          type: 'password',
          placeholder: 'Sua senha'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        try {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() }
          })

          // Fallback: migrar usuário do Mongo para Prisma no primeiro login
          if (!user) {
            try {
              const { default: connectDB } = await import('@/lib/mongodb')
              await connectDB()
              const { default: MongoUser } = await import('@/models/User')
              const mongoUser: any = await (MongoUser as any).findOne({ email: credentials.email.toLowerCase(), isActive: true }).select('+password')
              if (mongoUser) {
                const ok = await (mongoUser as any).comparePassword(credentials.password)
                if (!ok) {
                  throw new Error('Senha incorreta')
                }
                // Upsert no Prisma para não quebrar login
                user = await prisma.user.upsert({
                  where: { email: mongoUser.email.toLowerCase() },
                  update: {},
                  create: {
                    name: mongoUser.name,
                    email: mongoUser.email.toLowerCase(),
                    password: mongoUser.password,
                    role: mongoUser.role || 'visitor',
                    avatar: mongoUser.avatar || null,
                    phone: mongoUser.phone || null,
                    company: mongoUser.company || null,
                    bio: mongoUser.bio || null,
                    location: mongoUser.location || null,
                    website: mongoUser.website || null,
                    socialMedia: mongoUser.socialMedia || null,
                    preferences: mongoUser.preferences || null,
                    isActive: mongoUser.isActive !== false,
                  }
                })
              }
            } catch (e) {
              // Se fallback falhar, continua como não encontrado
            }
          }

          if (!user) {
            throw new Error('Usuário não encontrado ou inativo')
          }

          if (user.isActive === false) {
            throw new Error('Usuário não encontrado ou inativo')
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            throw new Error('Senha incorreta')
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar || undefined,
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          throw new Error(error instanceof Error ? error.message : 'Erro interno do servidor')
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          })
        ]
      : [])
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  callbacks: {
    async jwt({ token, user }) {
      // Primeira vez que o usuário faz login
      if (user) {
        token.role = user.role
        token.avatar = user.avatar
      }
      
      // Atualizar dados do usuário a cada request se necessário
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
          
          if (dbUser && dbUser.isActive !== false) {
            token.name = dbUser.name
            token.role = dbUser.role as any
            token.avatar = dbUser.avatar || undefined
          }
        } catch (error) {
          console.error('Erro ao atualizar token:', error)
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as 'admin' | 'member' | 'visitor')
        session.user.avatar = token.avatar as string
      }
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // Redirecionar para dashboard se for admin
      if (url.includes('/auth/login')) {
        return `${baseUrl}/dashboard`
      }
      
      // Permite redirecionamentos relativos
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Permite redirecionamentos para o mesmo site
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      return baseUrl
    }
  },
  
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`Novo usuário registrado: ${user.email}`)
      } else {
        console.log(`Usuário logado: ${user.email}`)
      }
    },
    
    async signOut({ token }) {
      console.log(`Usuário deslogado: ${token.email}`)
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
}

// Função utilitária para verificar se o usuário é admin
export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === 'admin'
}

// Função utilitária para verificar se o usuário é membro
export const isMember = (user: AuthUser | null): boolean => {
  return user?.role === 'member' || user?.role === 'admin'
}

// Função utilitária para verificar permissões
export const hasPermission = (user: AuthUser | null, requiredRole: string): boolean => {
  if (!user) return false
  
  const roleHierarchy = {
    visitor: 0,
    member: 1,
    admin: 2
  }
  
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}
