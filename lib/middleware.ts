import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Middleware to protect routes
export async function protectRoute(request: NextRequest, requiredRole?: 'admin' | 'broker') {
  // Get session from cookies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role if required
  if (requiredRole) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.session.user.id)
      .single();

    if (!user || user.role !== requiredRole) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return null;
}

// Check if user has permission
export async function hasPermission(userId: string, requiredRole: 'admin' | 'broker') {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (!user) return false;
  return user.role === requiredRole || user.role === 'admin';
}
