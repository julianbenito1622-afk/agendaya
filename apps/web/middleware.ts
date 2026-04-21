import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas protegidas
  const protectedRoutes = ['/panel', '/admin']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtected) return NextResponse.next()

  // Verificar sesión
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const response = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      )
    }
  })

  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay sesión y trata de entrar a /panel → redirige a login
  if (!session && pathname.startsWith('/panel')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si no hay sesión y trata de entrar a /admin → redirige a login
  if (!session && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/panel/:path*', '/admin/:path*']
}