import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';

// Helper to determine device type from User-Agent
function getDeviceType(userAgent: string | null): 'DESKTOP' | 'TABLET' | 'MOBILE' {
  if (!userAgent) return 'DESKTOP'; // Default to desktop if User-Agent is missing
  if (/Mobi|Android|iPhone|iPad|Tablet|Touch/i.test(userAgent)) {
    if (/iPad/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobi/i.test(userAgent))) {
      return 'TABLET';
    }
    return 'MOBILE';
  }
  return 'DESKTOP';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'Invalid request body, expected an array of events' }, { status: 400 });
    }

    const headerStore = req.headers;
    const ipAddress = headerStore.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || 'unknown';
    const userAgent = headerStore.get('user-agent');

    // Explicitly get Supabase URL and Key from process.env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key not found in environment variables.');
      return NextResponse.json({ error: 'Supabase URL and Key are required for analytics client creation.' }, { status: 500 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    let profileId = null;

    if (session?.user?.id) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      profileId = profile?.id || null;
    }

    const pageViewsToCreate = body.map((view: any) => ({
      timestamp: new Date(view.timestamp),
      path: view.path,
      userId: profileId,
      ipAddress: ipAddress,
      deviceType: getDeviceType(userAgent),
      userAgent: userAgent,
    }));

    await prisma.pageView.createMany({
      data: pageViewsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({ message: 'Analytics events received' }, { status: 200 });

  } catch (error) {
    console.error('Error processing analytics events:', error);
    return NextResponse.json({ error: 'Failed to process analytics events' }, { status: 500 });
  }
}
