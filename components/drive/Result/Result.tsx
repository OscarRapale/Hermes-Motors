'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type Ref } from 'react'
import { driveCopy } from '@/content/copy/drive'
import { HomeLink } from '@/components/site/HomeLink/HomeLink'
import { CloseIcon } from '@/components/site/icons/icons'
import { cardText } from '@/lib/card/text'
import { TOUCH_QUERY, useMedia } from '@/lib/drive/media'
import { resultView } from '@/lib/drive/result'
import { shareCard, type ShareOutcome } from '@/lib/drive/shareCard'
import type { SharedLap } from '@/lib/game/share'
import { T } from '@/lib/game/tuning'
import styles from './Result.module.css'

const copy = driveCopy.finish

type Props = {
  lap: SharedLap
  /** "finish": the end of your lap, over the blurred scene; "shared": someone's lap at /drive/r */
  mode: 'finish' | 'shared'
  onRunItBack?: () => void
  /** The first button: it takes focus at the finish */
  firstRef?: Ref<HTMLButtonElement>
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 13v6h14v-6" />
    </svg>
  )
}

/**
 * Boards 14 (desktop) and 17 (phone): the gap, the sectors, your card, Share and Run it back. A phone held
 * sideways gets the phone's content in two columns. /drive/r shows the same for a shared lap, in the card's
 * own words, with a way to the drive.
 */
export function Result({ lap, mode, onRunItBack, firstRef }: Props) {
  const v = resultView(lap)
  const card = cardText(lap)
  const touch = useMedia(TOUCH_QUERY)
  const [sharing, setSharing] = useState(false)
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null)
  const live = useRef<HTMLParagraphElement>(null)
  const finish = mode === 'finish'

  // read once, after the region exists, so it is announced (rules/game.md)
  useEffect(() => {
    if (finish && live.current) live.current.textContent = v.live
  }, [finish, v.live])

  const share = async () => {
    setSharing(true)
    setOutcome(null)
    setOutcome(await shareCard({ query: v.query, text: v.shareText, touch }))
    setSharing(false)
  }

  const shareButton = (primary: boolean, ref?: Ref<HTMLButtonElement>) => (
    <button
      ref={ref}
      type="button"
      className={primary ? styles.primary : styles.secondary}
      onClick={share}
      disabled={sharing}
      aria-busy={sharing}
    >
      {v.won && finish ? copy.shareWon : copy.share}
      {primary && <ShareIcon />}
    </button>
  )
  const runItBack = (primary: boolean, ref?: Ref<HTMLButtonElement>) => (
    <button ref={ref} type="button" className={primary ? styles.primary : styles.secondary} onClick={onRunItBack}>
      {copy.runItBack}
    </button>
  )

  const actions = !finish ? (
    <>
      <Link href="/drive" className={styles.primary}>
        {copy.beatHim}
      </Link>
      {shareButton(false)}
    </>
  ) : v.won ? (
    <>
      {shareButton(true, firstRef)}
      {runItBack(false)}
    </>
  ) : (
    <>
      {runItBack(true, firstRef)}
      {shareButton(false)}
    </>
  )

  const signed = v.won ? 'ahead' : 'behind'
  const headline = finish ? v.headline : card.headline
  const gap = finish ? v.gap : card.gap
  // /drive/r is a page of its own: its headline is the page's h1
  const Heading = finish ? 'h2' : 'h1'

  return (
    <section className={styles.result} data-mode={mode} aria-labelledby="result-title">
      {finish && (
        <div className={styles.bar}>
          <HomeLink />
          <span className={`label ${styles.barLabel}`}>{copy.bar}</span>
          <Link href="/" className={styles.exit} aria-label={copy.exit}>
            <span className={styles.exitText} aria-hidden="true">
              {copy.exit}
            </span>
            <CloseIcon />
          </Link>
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.text}>
          <p className={`label ${styles.kicker}`}>
            <span className={styles.long}>{copy.kicker(v.attempt)}</span>
            <span className={styles.short}>{copy.kickerShort(v.attempt)}</span>
          </p>
          <Heading id="result-title" className={`display ${styles.h}`}>
            {headline.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </Heading>
          <p className={styles.gap} data-state={signed}>
            {gap}
            <span className={styles.unit}>{driveCopy.card.unit}</span>
          </p>

          {finish && <p className={styles.summary}>{v.summary}</p>}
          <p className={`label ${styles.times}`}>{copy.times(v.you, v.his)}</p>
          {v.jumpStart && <p className={`label ${styles.penalty}`}>{driveCopy.card.jumpStart(T.jumpPenaltyS)}</p>}

          <table className={styles.table}>
            <caption className="visually-hidden">{copy.table}</caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">{copy.driver}</span>
                </th>
                {v.sectors.map((s) => (
                  <th key={s.name} scope="col">
                    {s.name}
                  </th>
                ))}
                <th scope="col">{copy.lap}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{copy.you}</th>
                {v.sectors.map((s) => (
                  <td key={s.name}>{s.you}</td>
                ))}
                <td>{v.you}</td>
              </tr>
              <tr>
                <th scope="row">{copy.messenger}</th>
                {v.sectors.map((s) => (
                  <td key={s.name}>{s.his}</td>
                ))}
                <td>{v.his}</td>
              </tr>
              <tr className={styles.gapRow}>
                <th scope="row">{copy.gap}</th>
                {v.sectors.map((s) => (
                  <td key={s.name} data-state={s.state}>
                    {s.gap}
                  </td>
                ))}
                <td data-state={signed}>{v.gap}</td>
              </tr>
            </tbody>
          </table>

          <ul className={styles.chips} aria-hidden="true">
            {v.sectors.map((s) => (
              <li key={s.name}>
                {s.name} <span data-state={s.state}>{s.gap}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>{actions}</div>
          <p role="status" className={styles.status}>
            {outcome?.done === 'saved' && copy.status.saved}
            {outcome?.done === 'failed' && copy.status.failed}
            {outcome?.done === 'saved-no-copy' && copy.status.savedNoCopy}
          </p>
          {outcome?.done === 'saved-no-copy' && (
            <input
              className={styles.link}
              readOnly
              value={outcome.url}
              aria-label={copy.status.savedNoCopy}
              onFocus={(e) => e.currentTarget.select()}
            />
          )}
          <p className={styles.note}>{copy.note}</p>
        </div>

        <div className={styles.cards}>
          <div className={styles.cardsTop}>
            <p className={`label ${styles.cardsLabel}`}>{finish ? copy.yourCard : copy.theCard}</p>
            <p className={styles.chipRow} aria-hidden="true">
              <span>{copy.linkChip}</span>
              <span>{copy.storyChip}</span>
            </p>
          </div>
          <div className={styles.previews}>
            <Image
              unoptimized
              src={`/api/card?${v.query}&format=link`}
              width={1200}
              height={630}
              alt={copy.cardAlt('link', v.said)}
              className={styles.linkCard}
            />
            <Image
              unoptimized
              src={`/api/card?${v.query}&format=story`}
              width={1080}
              height={1920}
              alt={copy.cardAlt('story', v.said)}
              className={styles.storyCard}
            />
          </div>
          <p className={styles.hint}>{copy.cardHint}</p>
        </div>
      </div>

      {finish && <p ref={live} className="visually-hidden" aria-live="polite" />}
    </section>
  )
}
