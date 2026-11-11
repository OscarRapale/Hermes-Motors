import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // CSS inlined into the HTML: one request fewer before first paint. On slow 4G that brings
    // the landing's LCP (the hero still, painted with the first frame) from 2.7 s to 2.2 s (D18).
    inlineCss: true,
  },
}

export default nextConfig
