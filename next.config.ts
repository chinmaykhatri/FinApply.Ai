import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // XSS protection (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // DNS prefetch control
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Enforce HTTPS (Vercel already does this, but belt-and-suspenders)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Permissions policy — disable unnecessary browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Content Security Policy — tightened for production, relaxed for dev
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://vercel.live`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https://d8j0ntlcm91z4.cloudfront.net",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://vercel.live",
      "frame-src 'self' https://vercel.live",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Skip ESLint during production builds — lint in CI/locally instead
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd8j0ntlcm91z4.cloudfront.net',
      },
    ],
  },

  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Disable X-Powered-By header (information disclosure)
  poweredByHeader: false,
};

export default nextConfig;
