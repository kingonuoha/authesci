import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import prisma

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/reset-password') &&
    !request.nextUrl.pathname.startsWith('/verify-email') &&
    !request.nextUrl.pathname.startsWith('/check-email') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/front-assets') &&
    !request.nextUrl.pathname.startsWith('/assets') &&
    !request.nextUrl.pathname.startsWith('/about') &&
    !request.nextUrl.pathname.startsWith('/contact') &&
    !request.nextUrl.pathname.startsWith('/privacy') &&
    !request.nextUrl.pathname.startsWith('/terms') &&
    !request.nextUrl.pathname.startsWith('/jobs') &&
    request.nextUrl.pathname !== '/'
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user) {
    const role = user.app_metadata.role as string | undefined;
    const pathname = request.nextUrl.pathname;

    // Profile check removed to avoid RLS issues in middleware.
    // We rely on user.app_metadata.role which is set during signup/login.

    // Profile completion check
    // if (profile.completionScore === 0 && !pathname.endsWith("/profile/edit")) {
    //   const url = request.nextUrl.clone();
    //   url.pathname = '/profile/edit';
    //   return NextResponse.redirect(url);
    // }

    const isAuthPage =
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/verify-email') ||
      pathname.startsWith('/check-email') ||
      pathname.startsWith('/auth');

    if (isAuthPage) {
      // Check if it's the reset-password page and a recovery flow
      const isResetPasswordRecovery = pathname.startsWith('/reset-password') && request.nextUrl.hash?.includes('type=recovery');

      if (isResetPasswordRecovery) {
        // Allow authenticated users to access the reset-password page during a recovery flow
        return supabaseResponse; // Continue to the reset-password page
      }

      // If user is on any other auth page, redirect to their dashboard ONLY if we know their role.
      // If the role is missing, let them stay on the auth page to re-login.
      if (role) {
        return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
      }
    } else {
      // For any other page, a role is required.
      if (!role) {
        // If role is missing, force re-authentication.
        return NextResponse.redirect(new URL('/login?message=role_missing', request.url));
      }

      // Role-based route protection
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
      }
      if (pathname.startsWith('/scientist') && role !== 'SCIENTIST') {
        return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
      }
      if (pathname.startsWith('/employer') && role !== 'EMPLOYER') {
        return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
      }
      if (pathname.startsWith('/collaborator') && role !== 'COLLABORATOR') {
        return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
      }
    }
  }

  // Set x-pathname header for Server Components to read
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);

  return supabaseResponse;
}
