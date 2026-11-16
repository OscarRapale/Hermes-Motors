import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // the share cards and the home preview read their fonts, stills and colour tokens at request time
  outputFileTracingIncludes: {
    '/api/card': ['./assets/fonts/*.ttf', './assets/card/*.png', './styles/tokens.css'],
    // the home page's link preview is drawn on request (night or day)
    '/opengraph-image': ['./assets/fonts/*.ttf', './assets/og/*.png', './styles/tokens.css'],
  },
  experimental: {
    // CSS inlined into the HTML: one request fewer before first paint. On slow 4G that brings
    // the landing's LCP (the hero still, painted with the first frame) from 2.7 s to 2.2 s (D18).
    inlineCss: true,
  },
}

// News stories are MDX (content/news/*.mdx, ARCHITECTURE §8), imported by their pages; no MDX routes.
const withMDX = createMDX({})

export default withMDX(nextConfig)
