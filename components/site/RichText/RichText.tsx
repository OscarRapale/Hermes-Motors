import type { RichText as RichTextValue } from '@/content/copy/shared'

/** Renders a copy line with inline links, as written in content/. */
export function RichText({ value, linkClassName }: { value: RichTextValue; linkClassName?: string }) {
  return (
    <>
      {value.map((part, i) =>
        part.href ? (
          <a key={i} href={part.href} className={linkClassName}>
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}
