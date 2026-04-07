import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Redirect to login if user is not authenticated and trying to access protected routes
  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth') &&
    pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated, check roles
  if (user) {
    // Optionally fetch role. In a real app we might cache this in session metadata 
    // to avoid DB calls on every request. But for MVP, let's fetch it from users table if accessing specific protected routes.
    // Or if Supabase auth.users raw_app_meta_data can store role.
    // Let's do a simple redirect from / to the dashboard based on role.
    if (pathname === '/' || pathname === '/login') {
      const { data: profile, error: dbErr } = await supabase.from('users').select('role').eq('id', user.id).single()
      
      console.log('--- DEBUG ROLE CHECK (Login/Root) ---', { 
        userId: user.id, 
        profile, 
        dbErr 
      })

      const role = profile?.role || 'officer'
      const url = request.nextUrl.clone()
      url.pathname = `/${role}/dashboard`
      return NextResponse.redirect(url)
    }

    // Protect /admin routes from non-admins
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/officer/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Protect /officer routes from admins
    if (pathname.startsWith('/officer')) {
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role === 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
