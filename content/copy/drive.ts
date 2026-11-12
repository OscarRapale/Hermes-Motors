// The test drive's copy (docs/content/copy.md → Test drive). Strings marked "new" aren't in copy.md yet.

export const driveCopy = {
  kicker: 'TEST DRIVE · PROVING GROUND',
  headline: ['BEAT THE', 'MESSENGER.'],
  /** "One flying lap against the test driver's ghost. His time is 1:11.906." (rotate screen) */
  intro: (lap: string) => `One flying lap against the test driver's ghost. His time is ${lap}.`,

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
    messenger: 'MESSENGER',
    delta: 'Δ MESSENGER',
  },

  keys: [
    { keys: ['W'], label: 'Throttle' },
    { keys: ['S'], label: 'Brake' },
    { keys: ['A', 'D'], label: 'Steer' },
    { keys: ['SPACE'], label: 'Overtake' },
    { keys: ['SHIFT'], label: 'Boost' },
  ],

  pause: {
    /** new: the pause button's name */
    button: 'Pause',
    title: 'Paused',
    resume: 'Resume',
    restart: 'Restart',
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
