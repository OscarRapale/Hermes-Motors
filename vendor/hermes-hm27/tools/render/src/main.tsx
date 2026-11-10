// Render harness: drives <HermesCar /> + <HermesStudio /> from URL params so headless Chromium can screenshot it.
import * as THREE from 'three'
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { HermesCar, HERMES_SPEC_STAGGER } from './hermes/HermesCar'
import { HermesStudio } from './hermes/HermesStudio'
import { HermesHelmet, HELMET_LIVERIES } from './hermes/HermesHelmet'
// the site draws the chin number in next/font's Michroma; the harness bundles the same face
import '@fontsource/michroma/400.css'
import { HermesEffects } from './hermes/HermesEffects'
import { LIVERIES } from './hermes/livery'
import { ContactShadows } from '@react-three/drei'
import { GhostCar, HORIZON, Track, TrackEnvironment } from './hermes/ProvingGround'

type Vec3 = [number, number, number]
type View = { pos: Vec3; target: Vec3; fov: number; explode?: number; mode?: 'day' | 'night' }
const VIEWS: Record<string, View> = {
  hero: { pos: [6.2, 1.4, 7.1], target: [-0.2, 0.5, -0.15], fov: 24 },
  night: { pos: [6.2, 1.4, 7.1], target: [-0.2, 0.5, -0.15], fov: 24, mode: 'night' },
  side: { pos: [8.2, 0.62, -0.1], target: [0, 0.52, -0.1], fov: 30 },
  sideR: { pos: [-8.2, 0.62, -0.1], target: [0, 0.52, -0.1], fov: 30 },
  rear: { pos: [-5.6, 1.75, -6.8], target: [0.15, 0.52, 0.1], fov: 25 },
  rearNight: { pos: [-4.7, 1.55, -5.8], target: [0, 0.5, -0.3], fov: 26, mode: 'night' },
  exploded: { pos: [8.2, 3.9, 8.8], target: [-0.1, 0.7, -0.1], fov: 30, explode: 1 },
  top: { pos: [0.001, 12, 0], target: [0, 0, 0], fov: 30 },
  chase: { pos: [0, 2.0, -7.2], target: [0, 0.55, 0.8], fov: 50 },
  landing: { pos: [6.1, 1.12, 6.9], target: [-0.15, 0.48, -0.15], fov: 24 },
  fin: { pos: [2.7, 1.35, -0.2], target: [0, 0.85, -0.65], fov: 30 },
  nose: { pos: [2.3, 0.95, 2.3], target: [0, 0.45, 1.15], fov: 30 },
  wing: { pos: [2.2, 1.2, -3.7], target: [0.3, 0.62, -2.2], fov: 30 },
  pod: { pos: [3.2, 0.7, 0.4], target: [0.3, 0.38, -0.3], fov: 32 },
  wheel: { pos: [2.6, 0.55, 2.6], target: [0.76, 0.33, 1.7], fov: 24 },
}
const q = new URLSearchParams(location.search)
const view = VIEWS[q.get('view') ?? 'hero'] ?? VIEWS.hero
const lod = q.get('lod') === 'game' ? 'game' : 'hero'
const liveryName = (q.get('livery') ?? 'firstLight') as keyof typeof LIVERIES
const mode = (q.get('mode') as 'day' | 'night' | null) ?? view.mode ?? 'day'
const explode = q.has('explode') ? Number(q.get('explode')) : (view.explode ?? 0)
const decals = q.get('decals') !== '0'
const dpr = Number(q.get('dpr') ?? 1)
const fx = q.get('fx') === '1'
const transparent = q.get('transparent') === '1'
const stagger = q.get('stagger') === 'specs' ? HERMES_SPEC_STAGGER : undefined
const path = q.get('path')
const fov = Number(q.get('fov') ?? view.fov)
// frames for the canvas are spaced evenly in distance travelled; the board's playback adds the easing
const linear = (u: number) => u

// explode lives in a ref so a frame script can step it without reloading: window.__setExplode(0.5), then wait for __done
const explodeRef = { current: explode }
const settle = Number(q.get('settle') ?? 8)
const ctl = { pending: 8 }
const w = window as unknown as Record<string, unknown>
w.__setExplode = (e: number) => {
  explodeRef.current = e
  ctl.pending = settle
  w.__done = null
}

/** The specs section's camera: close to the hero shot when assembled, higher and further back as the car opens. */
const SPEC_SHOTS = {
  assembled: { pos: new THREE.Vector3(6.1, 1.6, 6.9), look: new THREE.Vector3(-0.15, 0.5, -0.15) },
  exploded: { pos: new THREE.Vector3(8.6, 3.6, 9.3), look: new THREE.Vector3(-0.05, 0.8, -0.1) },
}
// one fixed camera for pre-rendered frames: only the moving parts change between frames, so they cross-fade cleanly
const SPEC_FIXED = {
  look: new THREE.Vector3(...((q.get('look') ?? '-0.62,0.42,0.42').split(',').map(Number) as Vec3)),
  dir: new THREE.Vector3(8.65, 2.8, 9.4).normalize(),
  dist: Number(q.get('dist') ?? 11.2),
}
function SpecRig() {
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera }) => {
    if (q.get('cam') === 'fixed') {
      camera.position.copy(SPEC_FIXED.look).addScaledVector(SPEC_FIXED.dir, SPEC_FIXED.dist)
      camera.lookAt(SPEC_FIXED.look)
      return
    }
    // most of the pull-back happens while the wings come off, since they add the most length
    const c = 1 - (1 - explodeRef.current) ** 3
    camera.position.lerpVectors(SPEC_SHOTS.assembled.pos, SPEC_SHOTS.exploded.pos, c)
    camera.lookAt(look.lerpVectors(SPEC_SHOTS.assembled.look, SPEC_SHOTS.exploded.look, c))
  })
  return null
}

function Rig({ target }: { target: Vec3 }) {
  const camera = useThree((s) => s.camera)
  useLayoutEffect(() => {
    if (target[0] === 0 && camera.position.y > 10) camera.up.set(0, 0, 1)
    camera.lookAt(...target)
  }, [camera, target])
  return null
}

function Ready() {
  const gl = useThree((s) => s.gl)
  const get = useThree((s) => s.get)
  w.__three = get
  useFrame(() => {
    if (ctl.pending > 0 && --ctl.pending === 0) w.__done = { triangles: gl.info.render.triangles, calls: gl.info.render.calls }
  })
  return null
}

const vec = (key: string, fallback: string) => (q.get(key) ?? fallback).split(',').map(Number) as Vec3

/** Test drive: layer=bg draws the track only, layer=cars the player, the messenger and the shadow (both transparent). */
function TrackApp() {
  const layer = q.get('layer') ?? 'all'
  const ghostAt = vec('ghost', '2.3,0,30')
  return (
    <Canvas dpr={dpr} gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }} camera={{ position: vec('chase', '0,1.55,-5.3'), fov: Number(q.get('fov') ?? 50), near: 0.1, far: 1500 }}>
      <Suspense fallback={null}>
        {layer !== 'cars' && (
          <>
            <fog attach="fog" args={[HORIZON, 70, 620]} />
            <Track />
          </>
        )}
        {layer !== 'bg' && (
          <>
            <TrackEnvironment />
            <HermesCar lod="game" livery={LIVERIES[liveryName]} decals={decals} />
            {q.get('noghost') !== '1' && <GhostCar position={ghostAt} />}
            <ContactShadows position={[0, 0.003, 0]} scale={9} resolution={1024} blur={2.4} far={1.1} opacity={0.82} color="#0E0F11" />
          </>
        )}
        <Ready />
      </Suspense>
      {fx && layer !== 'bg' && <HermesEffects />}
      <Rig target={vec('look', '0,0.9,10')} />
    </Canvas>
  )
}

/** Drivers page: one helmet. helmet=gallery|graphite|beforeDawn|messenger, num=9, hview=right|left|sideR|sideL */
const HELMET_VIEWS: Record<string, View> = {
  right: { pos: [-1.22, 0.36, 0.92], target: [0, 0.135, 0], fov: 12 },
  left: { pos: [1.22, 0.36, 0.92], target: [0, 0.135, 0], fov: 12 },
  sideR: { pos: [-1.6, 0.16, 0], target: [0, 0.135, 0], fov: 12 },
  sideL: { pos: [1.6, 0.16, 0], target: [0, 0.135, 0], fov: 12 },
}
function HelmetApp() {
  const hv = HELMET_VIEWS[q.get('hview') ?? 'right'] ?? HELMET_VIEWS.right
  const look = (q.get('helmet') ?? 'gallery') as keyof typeof HELMET_LIVERIES
  // mount the helmet once the face is in, so the number decals exist before the frame is taken
  const [font, setFont] = useState(false)
  useEffect(() => void document.fonts.load('400 168px Michroma').finally(() => setFont(true)), [])
  return (
    <Canvas dpr={dpr} gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }} camera={{ position: hv.pos, fov: Number(q.get('fov') ?? hv.fov), near: 0.05, far: 20 }}>
      <Suspense fallback={null}>
        <HermesStudio mode={mode} background={!transparent} shadow={false} />
        {font && <HermesHelmet livery={HELMET_LIVERIES[look] ?? HELMET_LIVERIES.gallery} number={q.get('num') ?? ''} fontFamily="Michroma" shadow={mode === 'night' ? 0.8 : 0.55} />}
        {font && <Ready />}
      </Suspense>
      <Rig target={hv.target} />
    </Canvas>
  )
}

createRoot(document.getElementById('root')!).render(
  q.get('scene') === 'helmet' ? <HelmetApp /> :
  q.get('scene') === 'track' ? <TrackApp /> :
  <Canvas dpr={dpr} gl={{ preserveDrawingBuffer: true, antialias: true }} camera={{ position: view.pos, fov, near: 0.05, far: 120 }}>
    <Suspense fallback={null}>
      <HermesStudio mode={mode} background={!transparent} />
      <HermesCar lod={lod} livery={LIVERIES[liveryName]} decals={decals} explode={explodeRef} explodeDamping={0} stagger={stagger} staggerEase={linear} />
      <Ready />
    </Suspense>
    {fx && <HermesEffects />}
    {path === 'specs' ? <SpecRig /> : <Rig target={view.target} />}
  </Canvas>,
)
