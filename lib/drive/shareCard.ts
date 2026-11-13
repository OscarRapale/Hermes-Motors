// "Share your card" (ARCHITECTURE §7.5, board 14's note): on a touch screen, the share sheet with the
// story card attached; elsewhere (or where files can't be shared) both cards are saved and the link to
// the result is copied. Browser only.

import { driveCopy } from '@/content/copy/drive'

export type ShareOutcome = { done: 'shared' | 'saved' | 'saved-no-copy' | 'cancelled' | 'failed'; url: string }

const card = async (query: string, format: 'link' | 'story') => {
  const res = await fetch(`/api/card?${query}&format=${format}`)
  if (!res.ok) throw new Error(`card ${res.status}`)
  return res.blob()
}

function save(blob: Blob, name: string) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 10_000)
}

export async function shareCard({ query, text, touch }: { query: string; text: string; touch: boolean }): Promise<ShareOutcome> {
  const url = new URL(`/drive/r?${query}`, window.location.origin).href
  try {
    if (touch && typeof navigator.share === 'function') {
      const file = new File([await card(query, 'story')], driveCopy.finish.file('story'), { type: 'image/png' })
      // some share targets drop `url` when there are files: the link rides in the text too
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `${text} ${url}` })
      else await navigator.share({ text, url })
      return { done: 'shared', url }
    }
    const [link, story] = await Promise.all([card(query, 'link'), card(query, 'story')])
    save(link, driveCopy.finish.file('link'))
    save(story, driveCopy.finish.file('story'))
    try {
      await navigator.clipboard.writeText(url)
      return { done: 'saved', url }
    } catch {
      return { done: 'saved-no-copy', url }
    }
  } catch (e) {
    return { done: e instanceof DOMException && e.name === 'AbortError' ? 'cancelled' : 'failed', url }
  }
}
