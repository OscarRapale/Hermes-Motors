import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // eslint-config-next defaults
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // The car package stays as delivered; the render harness has its own toolchain
    'vendor/**',
    'tools/**',
    'public/**',
  ]),
])

export default eslintConfig
