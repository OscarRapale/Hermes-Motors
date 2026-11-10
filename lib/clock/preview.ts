import type { Theme } from './phase'

/** sessionStorage key for the header's sun/moon preview (ARCHITECTURE §4.4). */
export const PREVIEW_KEY = 'hermes.preview'

export function parsePreview(value: string | null | undefined): Theme | null {
  return value === 'day' || value === 'night' ? value : null
}

export function readPreview(): Theme | null {
  try {
    return parsePreview(window.sessionStorage.getItem(PREVIEW_KEY))
  } catch {
    return null
  }
}

export function writePreview(theme: Theme | null): void {
  try {
    if (theme) window.sessionStorage.setItem(PREVIEW_KEY, theme)
    else window.sessionStorage.removeItem(PREVIEW_KEY)
  } catch {
    // Storage blocked (private mode, settings): the preview lasts until reload.
  }
}
