import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import connectDB from './mongodb'
import User from '@/models/User'
import { AuthUser } from '@/types'
import GoogleProvider from 'next-auth/providers/google'

const hasMongoUri = !!process.env.MONGODB_URI
const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET

// Nota: não falhar no build. Validar em runtime quando a rota de auth for usada.

// Só cria o client quando a variável existir
const client = hasMongoUri ? new MongoClient(process.env.MONGODB_URI as string) : null
const clientPromise = hasMongoUri ? client!.connect() : Promise.reject(new Error('MONGODB_URI não configurada'))

export const authOptions: NextAuthOptions = {
  adapter: hasMongoUri ? (MongoDBAdapter(clientPromise) as any) : undefined,
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
          await connectDB()
          
          // Buscar usuário por email
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase(),
            isActive: true 
          }).select('+password')

          if (!user) {
            throw new Error('Usuário não encontrado ou inativo')
          }

          // Bloquear login se email não verificado
          if (!user.emailVerified) {
            throw new Error('Email não verificado. Verifique seu email para entrar.')
          }
          // Verificar senha
          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (!isPasswordValid) {
            throw new Error('Senha incorreta')
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
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
          await connectDB()
          const dbUser = await User.findOne({ 
            email: token.email,
            isActive: true 
          })
          
          if (dbUser) {
            token.name = dbUser.name
            token.role = dbUser.role
            token.avatar = dbUser.avatar
            ;(token as any).emailVerified = dbUser.emailVerified
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
        ;(session.user as any).emailVerified = (token as any).emailVerified
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
