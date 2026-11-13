// What the finish screens (boards 14, 17) and /drive/r say about a lap (pure). Gaps are on times rounded
// to the millisecond, so the sector gaps add up to the lap gap (rules/game.md).

import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import { cardText } from '@/lib/card/text'
import { resultFromShared, shareQuery, type SharedLap } from '@/lib/game/share'
import { formatGap, formatLap, formatSector, gapsToMessenger } from '@/lib/game/timing'
import { T } from '@/lib/game/tuning'

const copy = driveCopy.finish

export type SectorRow = { name: string; you: string; his: string; gap: string; state: 'faster' | 'slower' | 'level' }

export type ResultView = {
  won: boolean
  attempt: number
  headline: readonly string[]
  /** "−0.214" / "+0.152" */
  gap: string
  you: string
  his: string
  sectors: SectorRow[]
  /** Board 14's sentence (Decision D30: figures, not words) */
  summary: string
  /** Read once at the finish (rules/game.md) */
  live: string
  /** The link's query, and what the card says (its alt text, the shared text) */
  query: string
  said: string
  shareText: string
  jumpStart: boolean
}

const seconds = (ms: number) => formatSector(Math.abs(ms))

function summary(you: string, his: string, gaps: number[], penalty: boolean): string {
  const s = copy.summary
  const lost = gaps.map((g, i) => [g, i + 1]).filter(([g]) => g > 0)
  const gained = gaps.map((g, i) => [g, i + 1]).filter(([g]) => g < 0)
  const total = (list: number[][]) => seconds(list.reduce((sum, [g]) => sum + g, 0))
  const where = (list: number[][]) => s.where(list.map(([, n]) => n))
  let how: string
  if (lost.length && gained.length) how = `${s.lost(total(lost), where(lost))} and ${s.gained(total(gained), where(gained))}.`
  else if (lost.length) how = `${s.lost(total(lost), where(lost))}.`
  else if (gained.length) how = `${s.gainedOnly(total(gained), where(gained))}.`
  else how = `${s.level}.`
  return [s.times(you, his), how, penalty ? s.penalty(T.jumpPenaltyS) : ''].filter(Boolean).join(' ')
}

export function resultView(lap: SharedLap): ResultView {
  const r = resultFromShared(lap)
  const gaps = gapsToMessenger(r)
  const won = gaps.lapMs < 0
  const you = formatLap(r.totalMs)
  const his = formatLap(messenger.lapMs)
  const sectors: SectorRow[] = r.sectorsMs.map((ms, k) => {
    const g = gaps.sectorsMs[k]
    return {
      name: copy.sectors[k],
      you: formatSector(ms),
      his: formatSector(messenger.sectorsMs[k]),
      gap: formatGap(g),
      state: g < 0 ? 'faster' : g > 0 ? 'slower' : 'level',
    }
  })
  const card = cardText(lap)
  const said = `${card.headline.join(' ')} ${card.gap} ${driveCopy.card.unit}`.replace(/\s+/g, ' ')
  const live = [
    copy.live.lap(you, seconds(gaps.lapMs), won),
    ...gaps.sectorsMs.map((g, k) => copy.live.sector(k + 1, seconds(g), g < 0)),
  ].join(' ')
  return {
    won,
    attempt: lap.attempt,
    headline: won ? copy.won : copy.lost,
    gap: formatGap(gaps.lapMs),
    you,
    his,
    sectors,
    summary: summary(you, his, gaps.sectorsMs, lap.jumpStart),
    live,
    query: shareQuery(lap),
    said: said.charAt(0) + said.slice(1).toLowerCase(),
    shareText: copy.shareText(won, card.gap),
    jumpStart: lap.jumpStart,
  }
}
