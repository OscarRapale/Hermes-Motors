'use client'
/**
 * The test drive's 3D layer (ARCHITECTURE §7, board 13), adapted from the car package's TestDriveScene:
 * the full Proving Ground, the player's car, the messenger's ghost and a chase camera. The game owns
 * every number: each frame this calls `onFrame(dt)` (the fixed-step loop), then draws `frame.current`.
 * The canvas is transparent; the dawn sky is CSS behind it (Drive.module.css).
 */
import * as THREE from 'three'
import { Suspense, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { HermesCar } from '@/components/hermes/HermesCar'
import { GhostCar, HORIZON, Track, TrackEnvironment, makeTrackCurve, trackStrip } from '@/components/hermes/ProvingGround'
import { HALF_WIDTH, RUNOFF, circuit } from '@/lib/game/circuit'
import { brakingBoards, circuitLayout, forBuilder } from '@/lib/game/layout'
import type { Frame } from '@/lib/drive/pose'

const CHASE = { back: 5.3, up: 1.55, lookAhead: 10, lookUp: 0.9, follow: 8 }

/** Scene colours come from the design tokens (styles/tokens.css), read once in the browser. */
function sceneColours() {
  const css = getComputedStyle(document.documentElement)
  const token = (name: string) => css.getPropertyValue(name).trim()
  return {
    runoff: token('--drive-runoff'),
    block: token('--drive-block'),
    glass: token('--drive-glass'),
    red: token('--redline'),
    far: token('--drive-far'),
    board: token('--gallery-white'),
    shadow: token('--carbon'),
  }
}

type SceneCircuit = {
  layout: ReturnType<typeof forBuilder>
  runoff: ReturnType<typeof forBuilder>['runoff']
  curve: THREE.CatmullRomCurve3
}
let built: SceneCircuit | null = null

/** The circuit for the package's builder (spans in its own metres), and the curve it builds; once. */
function sceneCircuit(): SceneCircuit {
  if (!built) {
    const c = circuit()
    const base = circuitLayout(c)
    const curve = makeTrackCurve(base)
    const layout = forBuilder(base, curve.getLength(), c.length)
    // the builder draws run-off out to 26 m, past our walls: the scene draws its own, to 12 m (§7.1)
    built = { layout: { ...layout, runoff: [] }, runoff: layout.runoff, curve }
  }
  return built
}

const BOARD_OFFSET = 3 // metres past the road's edge
const BOARD_W = 2.6
const BOARD_H = 1.8
const BOARD_Y = 2.3 // the panel's centre: above the walls, at the camera's eye line
const STRIPE_ANGLE = (14 * Math.PI) / 180 // the brand's 14°

function Scenery() {
  const { runoff, curve } = sceneCircuit()
  const colours = useMemo(() => sceneColours(), [])
  const m = useMemo(
    () => ({
      runoff: new THREE.MeshBasicMaterial({ color: colours.runoff, side: THREE.DoubleSide, toneMapped: false }),
      block: new THREE.MeshLambertMaterial({ color: colours.block }),
      glass: new THREE.MeshLambertMaterial({ color: colours.glass }),
      red: new THREE.MeshLambertMaterial({ color: colours.red }),
      far: new THREE.MeshLambertMaterial({ color: colours.far, side: THREE.DoubleSide }),
      board: new THREE.MeshLambertMaterial({ color: colours.board }),
    }),
    [colours],
  )
  const strips = useMemo(
    () =>
      runoff.map((r) => {
        const [a, b] = r.side === 'left' ? [HALF_WIDTH + 1.2, RUNOFF] : [-RUNOFF, -(HALF_WIDTH + 1.4)]
        return trackStrip(curve, a, b, r.from, r.to, 0.002, 1, Math.max(40, Math.round((r.to - r.from) * 1.4)))
      }),
    [runoff, curve],
  )
  // a far skyline round the whole circuit (the package's ring is sized for its opening stretch)
  const ring = useMemo(() => {
    const box = new THREE.Box3().setFromPoints(curve.getSpacedPoints(400))
    const centre = box.getCenter(new THREE.Vector3())
    return { x: centre.x, z: centre.z, r: box.getSize(new THREE.Vector3()).length() / 2 + 260 }
  }, [curve])

  // braking boards, 3-2-1 before each tight corner, on the outside verge, facing the approaching car
  const boards = useMemo(() => {
    const c = circuit()
    return brakingBoards(c).map((b) => {
      const p = c.toWorld(b.s, (b.side === 'left' ? 1 : -1) * (HALF_WIDTH + BOARD_OFFSET))
      return { ...b, x: p.x, z: p.z, heading: c.frameAt(b.s).heading }
    })
  }, [])

  return (
    <group>
      {boards.map((b) => (
        <group key={b.s} position={[b.x, 0, b.z]} rotation-y={b.heading}>
          <mesh position={[0, (BOARD_Y - BOARD_H / 2) / 2, 0]} material={m.glass}>
            <boxGeometry args={[0.14, BOARD_Y - BOARD_H / 2, 0.14]} />
          </mesh>
          <mesh position={[0, BOARD_Y, 0]} material={m.board}>
            <boxGeometry args={[BOARD_W, BOARD_H, 0.06]} />
          </mesh>
          {Array.from({ length: b.stripes }, (_, i) => (
            <mesh key={i} position={[(i - (b.stripes - 1) / 2) * 0.62, BOARD_Y, 0]} rotation-z={-STRIPE_ANGLE} material={m.red}>
              <boxGeometry args={[0.26, BOARD_H * 0.9, 0.08]} />
            </mesh>
          ))}
        </group>
      ))}
      {strips.map((g, i) => (
        <mesh key={i} geometry={g} material={m.runoff} />
      ))}
      {/* the package's start-straight scenery: pit building and tower on the left, a grandstand on the right */}
      <mesh position={[35, 3.2, 18]} material={m.block}>
        <boxGeometry args={[10, 6.4, 96]} />
      </mesh>
      <mesh position={[29.9, 4.2, 18]} material={m.glass}>
        <boxGeometry args={[0.2, 1.8, 94]} />
      </mesh>
      <mesh position={[29.85, 6.25, 18]} material={m.red}>
        <boxGeometry args={[0.25, 0.3, 96]} />
      </mesh>
      <mesh position={[37, 9.5, 78]} material={m.block}>
        <boxGeometry args={[9, 19, 9]} />
      </mesh>
      <mesh position={[32.4, 16.2, 78]} material={m.glass}>
        <boxGeometry args={[0.2, 3.4, 8]} />
      </mesh>
      <mesh position={[-31, 2.8, 26]} material={m.block}>
        <boxGeometry args={[9, 5.6, 64]} />
      </mesh>
      <mesh position={[-26.4, 3.3, 26]} material={m.glass}>
        <boxGeometry args={[0.2, 3.4, 62]} />
      </mesh>
      <mesh position={[ring.x, 7, ring.z]} material={m.far}>
        <cylinderGeometry args={[ring.r, ring.r, 14, 96, 1, true]} />
      </mesh>
    </group>
  )
}

type RigProps = {
  frame: RefObject<Frame>
  onFrame: (dt: number) => void
  /** No camera sway: the camera stays locked behind the car (rules/game.md) */
  reducedMotion: boolean
  /** Bumped on restart: the camera snaps instead of easing across the circuit */
  snap: RefObject<number>
  onReady: () => void
  /** The HUD's tag over the messenger: placed here each frame, above his car on screen */
  ghostTag: RefObject<HTMLElement | null>
}

const TAG_HEIGHT = 1.2 // metres: just over the messenger's car (the camera is at 1.55, so higher would sit on the horizon)

function Rig({ frame, onFrame, reducedMotion, snap, onReady, ghostTag }: RigProps) {
  const car = useRef<THREE.Group>(null)
  const messenger = useRef<THREE.Group>(null)
  const speed = useRef(0)
  const wheels = useRef(0)
  const lastSnap = useRef(-1)
  const ready = useRef(false)
  const shadow = useMemo(() => sceneColours().shadow, [])
  const v = useMemo(() => ({ fwd: new THREE.Vector3(), want: new THREE.Vector3(), look: new THREE.Vector3(), tag: new THREE.Vector3() }), [])

  useFrame(({ camera, size }, dt) => {
    onFrame(dt)
    const f = frame.current
    if (!f) return
    const p = f.player
    speed.current = f.speed
    wheels.current = f.wheels
    car.current?.position.set(p.x, 0, p.z)
    car.current?.rotation.set(0, p.heading, 0)
    if (messenger.current) {
      messenger.current.visible = f.ghost !== null
      if (f.ghost) {
        messenger.current.position.set(f.ghost.x, 0, f.ghost.z)
        messenger.current.rotation.set(0, f.ghost.heading, 0)
      }
    }
    // chase camera: behind and above the car, easing after it so turns read (locked under reduced motion)
    v.fwd.set(Math.sin(p.heading), 0, Math.cos(p.heading))
    v.want.set(p.x, CHASE.up, p.z).addScaledVector(v.fwd, -CHASE.back)
    if (reducedMotion || lastSnap.current !== snap.current) {
      camera.position.copy(v.want)
      lastSnap.current = snap.current
    } else camera.position.lerp(v.want, 1 - Math.exp(-dt * CHASE.follow))
    v.look.set(p.x, CHASE.lookUp, p.z).addScaledVector(v.fwd, CHASE.lookAhead)
    camera.lookAt(v.look)
    camera.updateMatrixWorld()
    // the messenger's tag: on screen above his car, hidden when he's behind the camera or off screen
    const tag = ghostTag.current
    if (tag) {
      let show = false
      if (f.ghost) {
        v.tag.set(f.ghost.x, TAG_HEIGHT, f.ghost.z).project(camera)
        show = v.tag.z < 1 && Math.abs(v.tag.x) < 1.1 && Math.abs(v.tag.y) < 1.1
        if (show) {
          const x = ((v.tag.x + 1) / 2) * size.width
          const y = ((1 - v.tag.y) / 2) * size.height
          tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`
        }
      }
      tag.toggleAttribute('data-show', show)
    }
    if (!ready.current) {
      ready.current = true
      requestAnimationFrame(onReady)
    }
  })

  return (
    <>
      <group ref={car}>
        <HermesCar lod="game" speed={speed} steer={wheels} />
        <ContactShadows position={[0, 0.003, 0]} near={-0.01} scale={9} resolution={1024} blur={2.4} far={1.1} opacity={0.82} color={shadow} />
      </group>
      <group ref={messenger} visible={false}>
        <GhostCar />
      </group>
    </>
  )
}

export type DriveSceneProps = RigProps & {
  /** Stops the render loop (the last frame stays) */
  paused: boolean
  label: string
}

export default function DriveScene({ paused, label, ...rig }: DriveSceneProps) {
  const { layout } = sceneCircuit()
  return (
    <Canvas
      aria-label={label}
      role="img"
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, CHASE.up, -CHASE.back], fov: 50, near: 0.1, far: 1500 }}
    >
      <fog attach="fog" args={[HORIZON, 70, 620]} />
      <Suspense fallback={null}>
        <Track layout={layout} scenery={false} />
        <Scenery />
        <TrackEnvironment />
        <Rig {...rig} />
      </Suspense>
    </Canvas>
  )
}
