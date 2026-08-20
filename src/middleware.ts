import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import { languageToRouteSegment, parseAcceptLanguage, routeSegmentToDefaultLocale, SUPPORTED_LOCALES } from '@/lib/i18n/config'

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

function isPathOrChild(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

function isPublicApi(pathname: string) {
  if (isPathOrChild(pathname, '/api/auth')) return true
  return PUBLIC_API_PREFIXES.some((prefix) => isPathOrChild(pathname, prefix))
}

function stripLocalePrefix(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'pt' && segments[0] !== 'en') return pathname

  return `/${segments.slice(1).join('/')}` || '/'
}

export default withAuth(
  function middleware(req: NextRequest & NextRequestWithAuth) {
    const url = req.nextUrl
    const { pathname } = url
    const routePathname = stripLocalePrefix(pathname)
    const token = req.nextauth.token
    const isAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || /\.[\w]+$/.test(pathname)
    const isApi = routePathname.startsWith('/api')
    let localeResponse: NextResponse | undefined

    if (!isApi && !isAsset) {
      const segments = pathname.split('/').filter(Boolean)
      const hasPrefix = segments[0] === 'pt' || segments[0] === 'en'

      if (hasPrefix) {
        const locale = routeSegmentToDefaultLocale(segments[0])
        const rewriteUrl = new URL(routePathname, req.url)
        rewriteUrl.search = url.search
        localeResponse = NextResponse.rewrite(rewriteUrl)
        localeResponse.cookies.set(LOCALE_COOKIE_KEY, locale, { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
      } else if (!routePathname.startsWith('/admin')) {
        const cookieLocale = req.cookies.get(LOCALE_COOKIE_KEY)?.value
        const headerLocale = parseAcceptLanguage(req.headers.get('accept-language'))
        const chosen = cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as any) ? cookieLocale : headerLocale
        const segment = languageToRouteSegment(chosen as Parameters<typeof languageToRouteSegment>[0])
        const redirectUrl = new URL(`/${segment}${routePathname}`, req.url)
        redirectUrl.search = url.search
        return NextResponse.redirect(redirectUrl)
      }
    }

    if (isApi && isPublicApi(routePathname)) return NextResponse.next()

    if (routePathname.startsWith('/admin')) {
      if (!token || (token as any).role !== 'admin') {
        return NextResponse.redirect(new URL('/login?error=insufficient_permissions', req.url))
      }
    }

    if (isPathOrChild(routePathname, '/api/admin')) {
      if (!token || (token as any).role !== 'admin') {
        return NextResponse.json(
          { error: 'Acesso negado. Apenas administradores podem acessar este recurso.' },
          { status: 403 }
        )
      }
    }

    if (routePathname.startsWith('/api/') && !isPublicApi(routePathname) && !token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    return localeResponse ?? NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = stripLocalePrefix(req.nextUrl.pathname)
        const publicPages = ['/sobre', '/servicos', '/produtos', '/noticias', '/colaboradores', '/contato', '/login', '/registro', '/esqueci-senha', '/redefinir-senha', '/privacidade', '/termos', '/cookies']

        if (
          pathname === '/' ||
          publicPages.some((path) => isPathOrChild(pathname, path)) ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          isPublicApi(pathname)
        ) {
          return true
        }

        if (pathname.startsWith('/admin') || pathname.startsWith('/perfil') || pathname.startsWith('/api/')) {
          return !!token
        }

        return true
      }
    }
  }
)

export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)',
    '/api/:path*',
    '/admin/:path*',
    '/perfil/:path*'
  ]
}
