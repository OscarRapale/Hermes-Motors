// Who can drive (ARCHITECTURE §3, §4.4): from 06:00 on Day One everyone; before it, only while previewing
// First Light (Decision D3), with a banner. The same rule is in Drive.module.css for the first paint.

import type { ClockState } from '@/lib/clock/client'

export const driveOpen = (clock: ClockState) => clock.phase === 'firstLight' || clock.theme === 'day'

export const previewBanner = (clock: ClockState) => clock.phase === 'before' && clock.theme === 'day'
