'use client'
/**
 * The specs section with the live car (board 11 on the design canvas).
 *
 * One fixed camera. Chapters 1 to 4 open the car in thirds (the wings, then the halo, then the body,
 * suspension and wheels lift off the floor); chapter 5 closes it again. The camera starts a little closer
 * and backs out as the parts spread, which is the board's 1.28 zoom.
 *
 * The canvas is transparent: the section's own background and type sit behind and around the car.
 * Load it client-side only, e.g. `dynamic(() => import('./SpecsApart'), { ssr: false })`.
 */
import * as THREE from 'three'
import { Suspense, useEffect, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { HermesCar, HERMES_SPEC_STAGGER } from '../hermes/HermesCar'
import { HermesStudio } from '../hermes/HermesStudio'

/** The explode value for chapters 1 to 5 (frames 0, 6, 12 and 18 of 18 on the board, then back to 0). */
export const SPEC_CHAPTER_EXPLODE = [0, 1 / 3, 2 / 3, 1, 0] as const

const LOOK = new THREE.Vector3(-0.62, 0.42, 0.42)
const DIR = new THREE.Vector3(8.65, 2.8, 9.4).normalize()
const DISTANCE = 11.2
const FOV = 24
const ZOOM_ASSEMBLED = 1.28

const easeOutCubic = (u: number) => 1 - (1 - u) ** 3
/** The stagger windows are linear because the chapter tween already eases. */
const linear = (u: number) => u

/** Moves the explode value to the chapter's target with the board's timing. */
function ChapterTween({ chapter, reduced, value }: { chapter: number; reduced: boolean; value: MutableRefObject<number> }) {
  const target = SPEC_CHAPTER_EXPLODE[Math.min(5, Math.max(1, chapter)) - 1]
  const tween = useRef({ from: value.current, start: 0, duration: 0 })
  useEffect(() => {
    const from = value.current
    const frames = Math.abs(target - from) * 18
    // closing the car (chapter 5) is a quick 600 ms snap; opening takes longer the further it travels
    const duration = reduced ? 0 : target < from && target === 0 ? 600 : Math.min(1500, 380 + 120 * frames)
    tween.current = { from, start: performance.now(), duration }
  }, [target, reduced, value])
  useFrame(() => {
    const { from, start, duration } = tween.current
    const t = duration === 0 ? 1 : Math.min(1, (performance.now() - start) / duration)
    value.current = from + (target - from) * easeOutCubic(t)
  })
  return null
}

function FixedCamera({ value }: { value: MutableRefObject<number> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useFrame(() => {
    camera.position.copy(LOOK).addScaledVector(DIR, DISTANCE)
    camera.lookAt(LOOK)
    const zoom = 1 + (ZOOM_ASSEMBLED - 1) * (1 - value.current) ** 3
    if (Math.abs(camera.zoom - zoom) > 1e-4) {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }
  })
  return null
}

export default function SpecsApart({ chapter, lod = 'hero', reducedMotion = false }: { chapter: number; lod?: 'hero' | 'game'; reducedMotion?: boolean }) {
  const value = useRef<number>(SPEC_CHAPTER_EXPLODE[Math.min(5, Math.max(1, chapter)) - 1])
  return (
    <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }} camera={{ fov: FOV, near: 0.05, far: 120 }} aria-hidden>
      <Suspense fallback={null}>
        <HermesStudio mode="day" background={false} />
        <HermesCar lod={lod} explode={value} explodeDamping={0} stagger={HERMES_SPEC_STAGGER} staggerEase={linear} />
      </Suspense>
      <ChapterTween chapter={chapter} reduced={reducedMotion} value={value} />
      <FixedCamera value={value} />
    </Canvas>
  )
}
