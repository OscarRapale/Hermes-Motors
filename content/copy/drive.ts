// The test drive's copy (docs/content/copy.md → Test drive). Strings marked "new" aren't in copy.md yet.

export const driveCopy = {
  kicker: 'TEST DRIVE · PROVING GROUND',
  headline: ['BEAT THE', 'MESSENGER.'],
  /** "One flying lap against the test driver's ghost. His time is 1:11.906." (rotate screen) */
  intro: (lap: string) => `One flying lap against the test driver's ghost. His time is ${lap}.`,

  /** The rotate screen (board 15): a phone held upright */
  rotate: {
    turn: 'TURN YOUR PHONE TO DRIVE',
    steps: [
      'Five red lights. Go when they go out.',
      'Get within one second of the messenger and Overtake unlocks.',
      'Finish the lap, then share your card.',
    ],
    status: 'Waiting for landscape',
    /** changed from the board: no game audio; never a word about sign-up or databases (Oscar) */
    footnote: 'Your time lives on the card.',
    /** new: the close button's name */
    close: 'Leave the test drive',
  },

  locked: 'The test drive opens at 06:00 on Day One.',
  /** new: the locked page's timer */
  timerLabel: 'Time until the test drive opens',
  previewBanner: 'Preview · the test drive opens at 06:00 on Day One',
  noWebgl: (lap: string) => `Your browser can't run the test drive. Here's the messenger's lap instead: ${lap}.`,
  /** new */
  loading: 'Loading the Proving Ground',
  /** new: the 3D layer's name for screen readers */
  sceneLabel: 'The Proving Ground: your car on the grid, the messenger’s ghost ahead',

  lights: { wait: 'WAIT FOR LIGHTS OUT', go: 'LIGHTS OUT AND AWAY' },
  /** new: what the lights say to a screen reader */
  lightsLabel: (lit: number) => (lit === 0 ? 'Lights out' : `${lit} of 5 red lights on`),

  hud: {
    title: 'BEAT THE MESSENGER',
    /** "ATTEMPT 3" */
    attempt: (n: number) => `ATTEMPT ${n}`,
    messenger: 'MESSENGER',
    best: 'YOUR BEST',
    delta: 'Δ MESSENGER',
    track: 'PROVING GROUND',
    grid: 'ON THE GRID',
    /** "42% · CHASING" / "LEADING" */
    progress: (pct: number, ahead: boolean) => `${pct}% · ${ahead ? 'LEADING' : 'CHASING'}`,
    you: 'YOU',
    theMessenger: 'THE MESSENGER',
    startFinish: 'S/F',
    overtakeReady: 'WITHIN 1 S · OVERTAKE READY',
    live: 'LIVE',
    sectors: ['S1', 'S2', 'S3'],
    kmh: 'KM/H',
    rpm: 'RPM',
    throttle: 'THR',
    brake: 'BRK',
    ers: 'ERS',
    straight: 'STRAIGHT',
    corner: 'CORNER',
    overtake: 'OVERTAKE',
    boost: 'BOOST',
    /** the compact HUD (board 16): "BEAT THE MESSENGER · ATTEMPT 3", "BEST 1:12.381", "Δ" */
    bestShort: 'BEST',
    deltaShort: 'Δ',
    /** board 16's 2 s effect while Overtake or Boost is on */
    fxOvertake: 'OVERTAKE ON · +0.5 MJ',
    fxBoost: 'BOOST · DEPLOYING',
    /** new: names of the HUD's parts for screen readers (from the prototype's labels) */
    labels: {
      timing: 'Lap timing',
      clock: 'Current lap time',
      sectorTimes: 'Sector times against the messenger',
      map: 'Track map',
      mapImage: 'Track map with your car and the messenger',
      dash: 'Speed, gear, energy and aero',
      speed: (kmh: number, gear: string) => `${kmh} kilometres per hour, gear ${gear}`,
    },
  },

  keys: [
    { keys: ['W', 'R SHIFT'], label: 'Throttle' },
    { keys: ['S', 'R CTRL'], label: 'Brake' },
    { keys: ['A', 'D'], label: 'Steer' },
    { keys: ['SPACE'], label: 'Overtake' },
    { keys: ['E'], label: 'Boost' },
  ],

  /** The share cards (copy.md → Card text; board 14 previews). The numbers come from the validated link */
  card: {
    won: ['I BEAT THE', 'MESSENGER BY'],
    lost: ['I CHASED THE', 'MESSENGER TO'],
    unit: 'S',
    tag: 'PROVING GROUND · BEAT THE MESSENGER',
    /** "YOU 1:11.692 · MESSENGER 1:11.906" (the story card puts them on two lines) */
    you: (lap: string) => `YOU ${lap}`,
    messenger: (lap: string) => `MESSENGER ${lap}`,
    /** new: after a jump start (Decision D9) */
    jumpStart: (s: number) => `INCLUDES ${s} S JUMP-START PENALTY`,
    /** the car's credit (docs/legal/credits.md): every card shows the car */
    credit: '3D model based on “2026 F1 CAR” by Abu Saif, CC BY 4.0, modified.',
  },

  /** Board 16's thumb controls (copy.md: "BRAKE", "THROTTLE", "OT", "BST"; caption changed from the board) */
  touch: {
    caption: 'STEER WITH THE BUTTONS',
    brake: 'BRAKE',
    throttle: 'THROTTLE',
    overtake: 'OT',
    boost: 'BST',
    /** new: the buttons' names (each includes its visible text: WCAG 2.5.3) */
    labels: {
      left: 'Steer left',
      right: 'Steer right',
      brake: 'Brake',
      throttle: 'Throttle',
      overtake: 'OT, Overtake',
      boost: 'BST, Boost for 2 seconds',
    },
  },

  /** new: the controls sheet, before the first start on a device and from the pause sheet (Oscar, 2026-11-12) */
  controls: {
    kicker: 'BEFORE THE LIGHTS',
    title: 'THE CONTROLS.',
    keyboardLabel: 'A keyboard with the keys that drive the car highlighted',
    /** what a highlighted key says on the drawing */
    keycaps: {
      KeyW: 'W',
      KeyA: 'A',
      KeyS: 'S',
      KeyD: 'D',
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
      KeyE: 'E',
      ShiftRight: 'SHIFT',
      ControlRight: 'CTRL',
      Space: 'SPACE',
      Escape: 'ESC',
    } as Record<string, string>,
    items: {
      throttle: { label: 'Throttle', keys: 'W, ↑ or Right Shift' },
      brake: { label: 'Brake', keys: 'S, ↓ or Right Ctrl' },
      steer: { label: 'Steer', keys: 'A and D, or ← and →' },
      overtake: { label: 'Overtake', keys: 'Space', note: 'Within 1 s of the messenger, once a lap' },
      boost: { label: 'Boost', keys: 'E', note: 'Spends energy; braking earns it back' },
      pause: { label: 'Pause', keys: 'Esc' },
    },
    tip: 'Brake at the 3 board before each tight corner. 2 and 1 count down to the turn.',
    start: 'Start',
    /** back to the pause sheet */
    back: 'Back',
  },

  pause: {
    /** new: the pause button's name */
    button: 'Pause',
    title: 'Paused',
    resume: 'Resume',
    restart: 'Restart',
    /** new: opens the controls sheet */
    controls: 'Controls',
    exit: 'Exit',
  },

  /** The finish (boards 14, 17) and /drive/r. Strings marked "new" aren't in copy.md yet */
  finish: {
    complete: 'LAP COMPLETE',
    won: ['YOU BEAT THE', 'MESSENGER.'],
    lost: ['THE MESSENGER', 'HOLDS ON.'],
    bar: 'TEST DRIVE · BEAT THE MESSENGER',
    exit: 'EXIT',
    /** "FLYING LAP · ATTEMPT 4 · PROVING GROUND" (the phone drops the last part) */
    kicker: (attempt: number) => `FLYING LAP · ATTEMPT ${attempt} · PROVING GROUND`,
    kickerShort: (attempt: number) => `FLYING LAP · ATTEMPT ${attempt}`,
    you: 'YOU',
    messenger: 'MESSENGER',
    gap: 'GAP',
    lap: 'LAP',
    sectors: ['S1', 'S2', 'S3'],
    /** new: the timing table, for screen readers */
    table: 'Your lap against the messenger, sector by sector',
    driver: 'Driver',
    /** "YOU 1:11.692 · MESSENGER 1:11.906" */
    times: (you: string, his: string) => `YOU ${you} · MESSENGER ${his}`,
    /** Decision D30: the summary with figures, not words ("four tenths") */
    summary: {
      times: (you: string, his: string) => `Your lap: ${you}. The test driver's: ${his}.`,
      lost: (s: string, where: string) => `You lost ${s} s in ${where}`,
      gained: (s: string, where: string) => `gained ${s} s in ${where}`,
      gainedOnly: (s: string, where: string) => `You gained ${s} s in ${where}`,
      level: 'You matched him sector for sector',
      /** "sector 1" / "sectors 2 and 3" / "sectors 1, 2 and 3" */
      where: (n: number[]) =>
        n.length === 1 ? `sector ${n[0]}` : `sectors ${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`,
      penalty: (s: number) => `It includes the ${s} s jump-start penalty.`,
    },
    /** new: what a screen reader hears at the finish (rules/game.md) */
    live: {
      lap: (lap: string, gap: string, faster: boolean) =>
        `Lap complete. ${lap}, ${gap} seconds ${faster ? 'faster' : 'slower'} than the messenger.`,
      sector: (n: number, gap: string, faster: boolean) => `Sector ${n} ${faster ? 'faster' : 'slower'} by ${gap}.`,
    },
    /** Buttons: won "Share your card" + "Run it back"; lost "Run it back" + "Share" (copy.md) */
    runItBack: 'Run it back',
    shareWon: 'Share your card',
    share: 'Share',
    /** /drive/r: someone else's lap, so the main button takes you to the drive */
    beatHim: 'Beat the messenger',
    /** changed (Oscar, 2026-11-13): never a word about sign-up or databases */
    note: 'Your time lives on the card.',
    yourCard: 'YOUR CARD',
    theCard: 'THE CARD',
    linkChip: 'LINK · 1200 × 630',
    storyChip: 'STORY · 1080 × 1920',
    /** board 14, adjusted: the link opens the result; it doesn't replay the lap */
    cardHint: "Share opens your phone's share sheet with the story card attached. On a computer it saves both cards and copies the link to your result.",
    /** new: the card previews' alt text */
    cardAlt: (format: 'link' | 'story', said: string) => `The ${format === 'link' ? 'link' : 'story'} card: ${said}`,
    /** new: what sharing says it did */
    status: {
      saved: 'Both cards saved. Link copied.',
      savedNoCopy: 'Both cards saved. Copy your link:',
      failed: "That didn't work. Try again.",
    },
    /** new: the text that goes with a shared card */
    shareText: (won: boolean, gap: string) =>
      won ? `I beat the messenger by ${gap} s at the Proving Ground.` : `I chased the messenger to ${gap} s at the Proving Ground.`,
    file: (format: 'link' | 'story') => `hermes-beat-the-messenger-${format}.png`,
  },
} as const
