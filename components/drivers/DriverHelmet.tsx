'use client'
// Copied from vendor/hermes-hm27/src/examples/DriverHelmet.tsx (v2.2). SITE CHANGES: imports from
// components/hermes, and `look` (a HELMET_LIVERIES key) as well as `livery`, so a caller can choose the look
// without importing three.js itself (this module is loaded with next/dynamic).
/**
 * Drivers page: one driver's helmet on its card. The card's own CSS background shows through (the studio's
 * room is off) and the helmet stands on its own soft ground shadow, like the drawing's ellipse.
 *
 * Motion   a slow sway around the three-quarter pose; drag to turn it, it springs back.
 *          Reduced motion: no sway (drag still works). Off screen: the canvas stops rendering.
 * Still    render the poster still (public/images/drivers/helmet-*.webp, shot from these same cameras and cropped
 *          to HELMET_FRAME) in the same box first, cross-fade to this canvas when onReady fires, and keep the still
 *          when WebGL2 is missing or data saver is on: the live-or-still pattern of the specs section.
 * Number   pass next/font's family so the chin number is drawn in Michroma:
 *            const michroma = Michroma({ weight: '400', subsets: ['latin'] })
 *            <DriverHelmet livery={HELMET_LIVERIES.gallery} number="9" fontFamily={michroma.style.fontFamily} />
 *
 * Load it client-side only: dynamic(() => import('@/components/drivers/DriverHelmet'), { ssr: false }).
 * Three canvases (two drivers + the messenger) are fine; with more, use drei's <View> for one shared context.
 */
import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PresentationControls } from '@react-three/drei'
import { HermesHelmet, HELMET_LIVERIES, type HelmetLivery } from '@/components/hermes/HermesHelmet'
import { HermesStudio } from '@/components/hermes/HermesStudio'

type Vec3 = [number, number, number]
/** The poster stills come from these cameras (tools/render: scene=helmet&hview=right|left&fov=15). */
export const HELMET_CAMERAS = {
  /** visor to the right: the left-hand card (the board's driver 9) and the messenger */
  right: { position: [-1.22, 0.36, 0.92] as Vec3, fov: 15 },
  /** visor to the left: the right-hand card (the board's driver 19, mirrored) */
  left: { position: [1.22, 0.36, 0.92] as Vec3, fov: 15 },
}
export const HELMET_TARGET: Vec3 = [0, 0.135, 0]
/** A still is the 1140 × 940 crop at (150, 120) of a 1440 × 1100 render; the live view renders the same crop,
 *  so in a box of the still's aspect (1140 / 940) the swap from still to live doesn't move a pixel. */
export const HELMET_FRAME = { fullWidth: 1440, fullHeight: 1100, x: 150, y: 120, width: 1140, height: 940 }

const REDUCE = '(prefers-reduced-motion: reduce)'
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(REDUCE)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(REDUCE).matches,
    () => true,
  )
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

function Aim() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    const f = HELMET_FRAME
    camera.aspect = f.fullWidth / f.fullHeight // the full frame's; the canvas shows its crop (manual camera)
    camera.setViewOffset(f.fullWidth, f.fullHeight, f.x, f.y, f.width, f.height)
    camera.lookAt(...HELMET_TARGET)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

/** Mounted inside <Suspense> after the helmet, so it fires once the helmet has actually been drawn. */
function Drawn({ onReady }: { onReady?: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    requestAnimationFrame(() => onReady?.())
  })
  return null
}

/** ±10° around the pose, one slow breath every 18 s */
function Sway({ still, children }: { still: boolean; children: ReactNode }) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = still ? 0 : Math.sin((clock.elapsedTime / 18) * Math.PI * 2) * THREE.MathUtils.degToRad(10)
  })
  return <group ref={g}>{children}</group>
}

export type HelmetLook = keyof typeof HELMET_LIVERIES

export type DriverHelmetProps = {
  livery?: HelmetLivery
  /** SITE CHANGE: a look by name (wins over `livery`) */
  look?: HelmetLook
  number?: string
  facing?: keyof typeof HELMET_CAMERAS
  /** before 06:00: the night room (pair it with HELMET_LIVERIES.beforeDawn) */
  night?: boolean
  fontFamily?: string
  /** called after the first frame, to fade out the poster still */
  onReady?: () => void
  className?: string
}

export function DriverHelmet({ look, livery: liveryProp = HELMET_LIVERIES.gallery, number = '', facing = 'right', night = false, fontFamily, onReady, className }: DriverHelmetProps) {
  const livery = look ? HELMET_LIVERIES[look] : liveryProp
  const still = useReducedMotion()
  const [ref, inView] = useInView<HTMLDivElement>()
  const cam = HELMET_CAMERAS[facing]
  return (
    // fills its box; give the box the still's aspect (aspect-ratio: 1140 / 940) and put the poster <img> under it
    <div ref={ref} className={className} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: cam.position, fov: cam.fov, near: 0.05, far: 20, manual: true }}
      >
        <Aim />
        <Suspense fallback={null}>
          {/* the helmet draws its own ground shadow (the messenger casts none) */}
          <HermesStudio mode={night ? 'night' : 'day'} background={false} shadow={false} />
          <PresentationControls global={false} cursor snap polar={[-0.08, 0.12]} azimuth={[-0.7, 0.7]}>
            <Sway still={still}>
              <HermesHelmet livery={livery} number={number} fontFamily={fontFamily} shadow={night ? 0.8 : 0.55} />
            </Sway>
          </PresentationControls>
          <Drawn onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
