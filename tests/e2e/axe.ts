import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// WCAG 2.2 AA (ARCHITECTURE §11)
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

export async function expectNoAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  // the rule, then each failing element and why (a failure that shows only in CI can be read from the log)
  expect(
    violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})\n${v.nodes.map((n) => `  ${n.target.join(' ')}: ${n.failureSummary ?? ''}`).join('\n')}`),
  ).toEqual([])
}
