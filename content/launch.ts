// The one instant the whole site turns on (ARCHITECTURE §4.1).
// Nothing else decides the phase; never build "06:00" from the visitor's local date.

/** PLACEHOLDER — Decisions D1 (date) and D2 (time zone) in docs/PROGRESS.md. */
export const DAY_ONE = '2027-02-14T06:00:00-04:00'
/** Until Decision D1 is made, the site prints campaign beats ("D−42", "DAY ONE · 06:00") instead of dates
    (06-news). Set to true once DAY_ONE is final. */
export const DAY_ONE_FINAL = false

/** PLACEHOLDER — Decision D2. UTC−4 all year (no daylight saving). */
export const PROVING_GROUND_TZ = 'America/Puerto_Rico'
