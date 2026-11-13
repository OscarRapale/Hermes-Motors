// What a share card says, from a validated lap (pure; the finish screens use it too).

import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import { resultFromShared, type SharedLap } from '@/lib/game/share'
import { formatLap, gapsToMessenger } from '@/lib/game/timing'
import { T } from '@/lib/game/tuning'

const copy = driveCopy.card

/** What a card says, from the lap */
export function cardText(s: SharedLap) {
  const r = resultFromShared(s)
  const gap = gapsToMessenger(r).lapMs
  const won = gap < 0
  return {
    won,
    headline: won ? copy.won : copy.lost,
    gap: (Math.abs(gap) / 1000).toFixed(3),
    you: copy.you(formatLap(r.totalMs)),
    messenger: copy.messenger(formatLap(messenger.lapMs)),
    jumpStart: s.jumpStart ? copy.jumpStart(T.jumpPenaltyS) : null,
  }
}
