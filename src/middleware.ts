import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import { languageToRouteSegment, parseAcceptLanguage, routeSegmentToDefaultLocale } from '@/lib/i18n/config'

const LOCALE_COOKIE_KEY = 'locale'

const PUBLIC_API_PREFIXES = [
  '/api/products',
  '/api/news',
  '/api/collaborators',
  '/api/config',
  '/api/newsletter',
  '/api/push/public-key',
  '/api/push/subscribe',
  '/api/market',
  '/api/legal-content',
  '/api/public-images',
  '/api/public-assets',
  '/api/contact',
]

function isPublicApi(pathname: string) {
  if (pathname.startsWith('/api/auth')) return true
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default withAuth(
  function middleware(req: NextRequest & NextRequestWithAuth) {
    const url = req.nextUrl
    const { pathname } = url
    const token = req.nextauth.token

    // Skip next.js internals and assets
    const isAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || /\.[\w]+$/.test(pathname)
    const isApi = pathname.startsWith('/api')

    // Locale handling for non-API, non-asset, non-admin routes
    if (!isApi && !isAsset && !pathname.startsWith('/admin')) {
      const segments = pathname.split('/').filter(Boolean)
      const hasPrefix = segments[0] === 'pt' || segments[0] === 'en'

      if (hasPrefix) {
        // When prefix present, set cookie accordingly and rewrite to underlying route
        const locale = routeSegmentToDefaultLocale(segments[0])
        const response = NextResponse.rewrite(new URL('/' + segments.slice(1).join('/'), req.url))
        response.cookies.set(LOCALE_COOKIE_KEY, locale, { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
        return response
      } else {
        // No prefix: decide preferred locale and redirect to prefixed URL
        const cookieLocale = req.cookies.get(LOCALE_COOKIE_KEY)?.value
        const headerLocale = parseAcceptLanguage(req.headers.get('accept-language'))
        const chosen = (cookieLocale as any) || headerLocale
        const segment = languageToRouteSegment(chosen as any)
        const redirectUrl = new URL(`/${segment}${pathname}`, req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    if (isApi && isPublicApi(pathname)) {
      return NextResponse.next()
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token || (token as any).role !== 'admin') {
        return NextResponse.redirect(new URL('/login?error=insufficient_permissions', req.url))
      }
    }

    // Protect admin API routes
    if (pathname.startsWith('/api/admin')) {
      if (!token || (token as any).role !== 'admin') {
        return NextResponse.json(
          { error: 'Acesso negado. Apenas administradores podem acessar este recurso.' },
          { status: 403 }
        )
      }
    }

    if (pathname.startsWith('/api/') && !isPublicApi(pathname)) {
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

        // Public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/sobre') ||
          pathname.startsWith('/servicos') ||
          pathname.startsWith('/produtos') ||
          pathname.startsWith('/noticias') ||
          pathname.startsWith('/colaboradores') ||
          pathname.startsWith('/contato') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/registro') ||
          pathname.startsWith('/esqueci-senha') ||
          pathname.startsWith('/redefinir-senha') ||
          pathname.startsWith('/privacidade') ||
          pathname.startsWith('/termos') ||
          pathname.startsWith('/cookies') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          isPublicApi(pathname)
        ) {
          return true
        }

        // Protected routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/perfil') || pathname.startsWith('/api/')) {
          return !!token
        }

        // Default allow
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    // Run on all pages for locale handling, excluding API and Next internals and files
    '/((?!api|_next|.*\\..*).*)',
    // Also run on these specific routes for auth/API protections
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/config',
    '/api/newsletter/:path*',
    '/api/push/:path*',
    '/api/market/:path*',
    '/api/products/:path*',
    '/api/news/:path*',
    '/api/collaborators/:path*',
    '/api/contacts/:path*',
    '/perfil/:path*'
  ]
}
