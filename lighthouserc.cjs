// Lighthouse CI (ARCHITECTURE §10): desktop, on the landing page, the test drive and the news. CI fails
// under 90 for performance; accessibility, best practices and SEO, and CLS, warn. Reports stay on disk
// (uploaded as a CI artifact), never to a public server.
const PORT = 3300
const base = `http://localhost:${PORT}`

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npm run start -- -p ${PORT}`,
      startServerReadyPattern: 'Ready',
      url: [`${base}/`, `${base}/drive`, `${base}/news`],
      numberOfRuns: 1,
      settings: { preset: 'desktop' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.05 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
}
