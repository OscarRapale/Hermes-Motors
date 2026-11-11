import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Three Fiber mutates three.js objects on purpose (renderer settings in effects, part
    // transforms inside useFrame): .claude/rules/three.md. The React Compiler's immutability rule
    // reads those as React state, so it is off for the 3D folders only.
    files: [
      'components/hermes/**',
      'components/specs/**',
      'components/drive/**',
      'components/drivers/**',
      'app/drive/**',
    ],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
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
