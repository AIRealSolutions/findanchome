import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: `Server config error: URL=${supabaseUrl ? 'SET' : 'MISSING'}, KEY=${supabaseKey ? 'SET' : 'MISSING'}` },
        { status: 500 }
      );
    }

    // Call Supabase Auth REST API directly using native fetch
    const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.error_description || data.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: `Fetch error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
