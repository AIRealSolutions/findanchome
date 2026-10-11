/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  },
  // Keep private app areas out of search and AI indexes even if linked externally.
  async headers() {
    return ['/admin/:path*', '/crm/:path*', '/dashboard/:path*', '/debug/:path*', '/auth/:path*', '/login', '/forgot-password'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }));
  },
  // Old or mistyped URLs that may still be linked from elsewhere.
  async redirects() {
    return [
      { source: '/communities', destination: '/explore', permanent: true },
      { source: '/agents', destination: '/about', permanent: true },
      { source: '/community/onslow/:town', destination: '/explore/onslow', permanent: true },
      { source: '/homes', destination: '/properties', permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'ztsvyfcwaxhaurssgiqt.supabase.co' }],
  },
};

module.exports = nextConfig;
