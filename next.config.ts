import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://accounts.google.com https://vercel.live",
            "style-src 'self' 'unsafe-inline' https://accounts.google.com",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://accounts.google.com https://vercel.live",
            "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://accounts.google.com https://oauth2.googleapis.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self' https://accounts.google.com",
          ].join('; '),
        },
      ],
    },
  ],
}

export default nextConfig
