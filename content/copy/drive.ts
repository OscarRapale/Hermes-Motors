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
    /** changed from the board: no game audio is planned */
    footnote: 'No sign-up. Your time lives on the card.',
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

  finish: {
    complete: 'LAP COMPLETE',
    won: ['YOU BEAT THE', 'MESSENGER.'],
    lost: ['THE MESSENGER', 'HOLDS ON.'],
    you: 'YOU',
    messenger: 'MESSENGER',
    runItBack: 'Run it back',
    /** new: the jump-start penalty on the result (Decision D9) */
    jumpStart: 'Jump start · +5 s',
  },
} as const
