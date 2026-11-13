// Titles and descriptions per route, from docs/content/seo.md.
// Routes are added as their pages are built.

export type RouteSeo = {
  title: string
  description: string
}

export const SITE_NAME = 'Hermes Motors'

export const seo = {
  home: {
    title: 'Hermes Motors · Speed is the message',
    description:
      'A new Grand Prix team and its first car, the HM‑27. Revealed at 06:00 on Day One. Then race the messenger.',
  },
  drive: {
    title: 'Beat the messenger · Hermes Motors',
    description: "One flying lap of the Proving Ground against the test driver's ghost. His time is 1:11.906.",
  },
} satisfies Record<string, RouteSeo>

/** /drive/r (seo.md: "I beat the messenger by 0.214 s · Hermes Motors"; the description is built from the result) */
export const resultSeo = {
  title: (won: boolean, gap: string) =>
    won ? `I beat the messenger by ${gap} s · ${SITE_NAME}` : `I chased the messenger to ${gap} s · ${SITE_NAME}`,
  description: (you: string, his: string) => `A flying lap of the Proving Ground in ${you}. The messenger's time is ${his}.`,
}
