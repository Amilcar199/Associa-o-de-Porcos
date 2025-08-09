import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'member' | 'visitor'
      avatar?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'admin' | 'member' | 'visitor'
    avatar?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    avatar?: string
  }
}
