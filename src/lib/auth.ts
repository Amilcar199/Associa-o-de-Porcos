import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import connectDB from './mongodb'
import User from '@/models/User'
import { AuthUser } from '@/types'
import GoogleProvider from 'next-auth/providers/google'
import { checkRateLimit } from './rate-limit'

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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        // Rate limiting contra força bruta no login.
        // O segundo parâmetro do authorize() do NextAuth não é um NextRequest
        // completo (não tem métodos como .get()), por isso extraímos o IP
        // diretamente do objeto de headers disponível aqui.
        const rawHeaders = (req?.headers ?? {}) as Record<string, string | string[] | undefined>
        const forwardedFor = rawHeaders['x-forwarded-for'] ?? rawHeaders['X-Forwarded-For']
        const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(',')[0]?.trim()
          || (rawHeaders['x-real-ip'] as string | undefined)
          || 'unknown'
        const emailKey = credentials.email.toLowerCase()

        // Limite por IP: evita credential-stuffing (testar muitas contas a partir do mesmo IP)
        const ipLimit = checkRateLimit(ip, { key: 'login-ip', limit: 20, windowMs: 15 * 60 * 1000 })
        // Limite por email: evita força bruta contra uma única conta a partir de vários IPs
        const emailLimit = checkRateLimit(emailKey, { key: 'login-email', limit: 5, windowMs: 15 * 60 * 1000 })

        if (!ipLimit.success || !emailLimit.success) {
          throw new Error('Demasiadas tentativas de login. Aguarde alguns minutos e tente novamente.')
        }

        try {
          await connectDB()
          
          // Buscar usuário por email
          const user = await User.findOne({ 
            email: emailKey,
            isActive: true 
          }).select('+password')

          if (!user) {
            throw new Error('Usuário não encontrado ou inativo')
          }

          // Permitir login independentemente do status de verificação de email
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
