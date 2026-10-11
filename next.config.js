/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  },
  // Keep private app areas out of search and AI indexes even if linked externally.
  async headers() {
    return ['/admin/:path*', '/crm/:path*', '/dashboard/:path*', '/debug/:path*', '/auth/:path*', '/login'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }));
  },
  images: {
    domains: ['ztsvyfcwaxhaurssgiqt.supabase.co'],
  },
};

module.exports = nextConfig;
