import type { MDXComponents } from 'mdx/types'

// Required by @next/mdx in the App Router. The news article styles its MDX by CSS (components/news), so
// the elements stay plain.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components }
}
