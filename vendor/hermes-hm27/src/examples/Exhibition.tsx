'use client'
/**
 * Landing exhibition: the HM-27 in the studio. Drag to turn it, scroll to take it apart
 * (the camera pulls back as it opens). Until First Light (06:00 at the Proving Ground on Day One,
 * one moment for everyone) it shows the Before Dawn livery in the night room.
 * Pass the site's Day One instant as `firstLight` (an ISO string with its offset).
 *
 * In Next.js, load it client-side only (it reads window on first render):
 *   const Exhibition = dynamic(() => import('@/components/hermes/Exhibition'), { ssr: false })
 */
import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PresentationControls } from '@react-three/drei'
import { HermesCar } from '../hermes/HermesCar'
import { HermesStudio } from '../hermes/HermesStudio'
import { HermesEffects } from '../hermes/HermesEffects'
import { BEFORE_DAWN, FIRST_LIGHT } from '../hermes/livery'

const isBeforeDawn = (firstLight?: string) => (firstLight ? Date.now() < Date.parse(firstLight) : false)

/** Hero framing when assembled, wider and higher when exploded; eased with the car. */
function CameraRig({ explode }: { explode: RefObject<number> }) {
  const shots = useMemo(
    () => ({
      assembled: { pos: new THREE.Vector3(6.2, 1.4, 7.1), look: new THREE.Vector3(-0.2, 0.5, -0.15) },
      exploded: { pos: new THREE.Vector3(8.2, 3.9, 8.8), look: new THREE.Vector3(-0.1, 0.7, -0.1) },
    }),
    [],
  )
  const look = useMemo(() => new THREE.Vector3(), [])
  const eased = useRef(0)
  useFrame(({ camera }, dt) => {
    eased.current = THREE.MathUtils.damp(eased.current, explode.current ?? 0, 4, Math.min(dt, 0.1))
    camera.position.lerpVectors(shots.assembled.pos, shots.exploded.pos, eased.current)
    camera.lookAt(look.lerpVectors(shots.assembled.look, shots.exploded.look, eased.current))
  })
  return null
}

export default function Exhibition({ firstLight }: { firstLight?: string } = {}) {
  const explode = useRef(0)
  const [night] = useState(() => isBeforeDawn(firstLight))
  const [small] = useState(() => window.matchMedia('(max-width: 768px)').matches)

  useEffect(() => {
    // 0 at the top of the page, fully exploded after one screen of scroll; the car eases between
    const onScroll = () => {
      explode.current = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Canvas dpr={[1, small ? 1.5 : 2]} camera={{ position: [6.2, 1.4, 7.1], fov: 24 }}>
      <Suspense fallback={null}>
        <HermesStudio mode={night ? 'night' : 'day'} />
        <PresentationControls global snap polar={[-0.05, 0.2]} azimuth={[-Math.PI / 2, Math.PI / 2]}>
          <HermesCar lod={small ? 'game' : 'hero'} livery={night ? BEFORE_DAWN : FIRST_LIGHT} explode={explode} />
        </PresentationControls>
      </Suspense>
      <CameraRig explode={explode} />
      {!small && <HermesEffects />}
    </Canvas>
  )
}
