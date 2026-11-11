'use client'

/**
 * The specs section's live car (ARCHITECTURE §6), adapted from the car package's SpecsApart: the
 * same fixed camera as the pre-rendered frames, so the canvas lines up with them and with their
 * callout anchors. The explode value comes from the section's own tween (frame / 18); the zoom is
 * the section's CSS zoom on the layer around this canvas, exactly as for the frames.
 * Load with next/dynamic, ssr: false.
 */
import * as THREE from 'three'
import { Suspense, useCallback, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { HermesCar, HERMES_SPEC_STAGGER } from '@/components/hermes/HermesCar'
import { HermesStudio } from '@/components/hermes/HermesStudio'
import { BEFORE_DAWN, FIRST_LIGHT } from '@/components/hermes/livery'
import { LAST_FRAME } from '@/lib/specs/chapters'

// The frames' camera (tools/render, path=specs&cam=fixed&fov=24): look, direction, distance.
const LOOK = new THREE.Vector3(-0.62, 0.42, 0.42)
const DIR = new THREE.Vector3(8.65, 2.8, 9.4).normalize()
const DISTANCE = 11.2
const FOV = 24
const linear = (u: number) => u

function FixedCamera() {
  const camera = useThree((s) => s.camera)
  useFrame(() => {
    camera.position.copy(LOOK).addScaledVector(DIR, DISTANCE)
    camera.lookAt(LOOK)
  })
  return null
}

/** Calls `onFirstFrame` once the car is built and one frame has been drawn with it. */
function FirstFrame({ ready, onFirstFrame }: { ready: RefObject<boolean>; onFirstFrame: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (!done.current && ready.current) {
      done.current = true
      requestAnimationFrame(onFirstFrame)
    }
  })
  return null
}

export type SpecsSceneProps = {
  /** The section's frame position, 0…18 (shared with the frame stack) */
  frame: RefObject<number>
  night: boolean
  lod: 'hero' | 'game'
  /** false while the section is off screen: the loop stops */
  active: boolean
  onReady: () => void
}

export default function SpecsScene({ frame, night, lod, active, onReady }: SpecsSceneProps) {
  // HermesCar reads explode.current every frame: a live view of the section's frame position.
  const explode = useMemo(
    () =>
      ({
        get current() {
          return (frame.current ?? 0) / LAST_FRAME
        },
      }) as RefObject<number>,
    [frame],
  )
  const ready = useRef(false)
  const markReady = useCallback(() => {
    ready.current = true
  }, [])

  return (
    <Canvas
      dpr={lod === 'hero' ? [1, 2] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov: FOV, near: 0.05, far: 120 }}
      // The canvas sits inside the section's CSS zoom layer: measure without transforms, or the
      // zoom would be applied twice (once to the canvas size, once by the layer).
      resize={{ offsetSize: true }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <HermesStudio mode={night ? 'night' : 'day'} background={false} />
        <HermesCar
          lod={lod}
          livery={night ? BEFORE_DAWN : FIRST_LIGHT}
          explode={explode}
          explodeDamping={0}
          stagger={HERMES_SPEC_STAGGER}
          staggerEase={linear}
          onReady={markReady}
        />
      </Suspense>
      <FixedCamera />
      <FirstFrame ready={ready} onFirstFrame={onReady} />
    </Canvas>
  )
}
