// The site's sound files (public/audio, made by `npm run assets` from vendor/audio; credits: /credits).

export const SOUNDS = {
  /** The dashboard's ignition: an engine starting, 3.1 s (Pixabay, car-engine.mp3) */
  ignition: '/audio/ignition.mp3',
  /** The test drive's engine: 2.6 s of steady engine note made into a seamless loop, about 94 Hz as
      recorded (Pixabay, race-car.mp3, 26.0–28.6 s; scripts/assets.mjs) */
  engine: '/audio/engine-loop.wav',
  /** The test drive's soundtrack: "Hagion" by DJ Seduce (Epidemic Sound, Decision D31), 3:10, streamed */
  music: '/audio/soundtrack.mp3',
} as const

/** The engine loop's pitch as recorded, for mapping RPM to playback rate */
export const ENGINE_LOOP_HZ = 94
