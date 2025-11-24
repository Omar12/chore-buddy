import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware to handle authentication and session management
 * Runs on every request to protected routes
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user }, error } = await supabase.auth.getUser();

  // Protect routes that require authentication
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isParentPage = request.nextUrl.pathname.startsWith('/parent');
  const isKidPage = request.nextUrl.pathname.startsWith('/kid');
  const isProfileSelect = request.nextUrl.pathname === '/profile/select';

  // If user is not authenticated and trying to access protected routes
  if (!user && (isParentPage || isKidPage || isProfileSelect)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth pages
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/profile/select';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
