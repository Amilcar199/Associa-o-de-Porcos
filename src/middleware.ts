import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    const TEMP_BYPASS_ADMIN_AUTH = false
    if (TEMP_BYPASS_ADMIN_AUTH && (pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))){
      return NextResponse.next()
    }

    // Permitir publicamente endpoints públicos de leitura
    if (pathname.startsWith('/api/products') || pathname.startsWith('/api/news')) {
      return NextResponse.next()
    }

    // Proteger rotas do admin
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/login?error=insufficient_permissions', req.url))
      }
    }

    // Proteger rotas de API do admin
    if (pathname.startsWith('/api/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.json(
          { error: 'Acesso negado. Apenas administradores podem acessar este recurso.' },
          { status: 403 }
        )
      }
    }

    // Proteger API routes que requerem autenticação
    if (pathname.startsWith('/api/auth') && !pathname.startsWith('/api/auth/session')) {
      // Permitir rotas de autenticação
      return NextResponse.next()
    }

    if (pathname.startsWith('/api/') && pathname !== '/api/contact') {
      if (!token) {
        return NextResponse.json(
          { error: 'Token de autenticação necessário' },
          { status: 401 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Sempre permitir acesso às rotas públicas
        if (
          pathname === '/' ||
          pathname.startsWith('/sobre') ||
          pathname.startsWith('/produtos') ||
          pathname.startsWith('/noticias') ||
          pathname.startsWith('/colaboradores') ||
          pathname.startsWith('/contato') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/registro') ||
          pathname.startsWith('/esqueci-senha') ||
          pathname.startsWith('/redefinir-senha') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname === '/api/contact' ||
          pathname.startsWith('/api/products') ||
          pathname.startsWith('/api/news')
        ) {
          return true
        }

        // Para rotas protegidas, verificar se tem token
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/products/:path*',
    '/api/news/:path*',
    '/api/collaborators/:path*',
    '/api/contacts/:path*',
    '/perfil/:path*'
  ]
}
