'use client'
/**
 * The test drive's 3D layer: the Proving Ground, the player's car, the messenger's ghost and a chase camera.
 *
 * Your game loop owns every number (refs) and the scene only reads them each frame, so nothing re-renders
 * while driving. Poses are in metres and radians; heading 0 points +Z and positive headings turn left.
 * Pass a closed `layout` for the full lap (see ProvingGround.tsx); without one you get the opening stretch.
 */
import * as THREE from 'three'
import { Suspense, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { HermesCar } from '../hermes/HermesCar'
import { GhostCar, HORIZON, Track, TrackEnvironment, type TrackLayout } from '../hermes/ProvingGround'

export type CarPose = { x: number; z: number; heading: number }

export type TestDriveSceneProps = {
  player: MutableRefObject<CarPose>
  /** The messenger's pose at the same lap time; null hides it (the first seconds, or after the finish). */
  ghost: MutableRefObject<CarPose | null>
  /** m/s, spins the wheels */
  speed: MutableRefObject<number>
  /** radians, turns the front wheels */
  steer: MutableRefObject<number>
  layout?: TrackLayout
}

const CHASE = { back: 5.3, up: 1.55, lookAhead: 10, lookUp: 0.9, follow: 8 }

function Cars({ player, ghost, speed, steer }: TestDriveSceneProps) {
  const car = useRef<THREE.Group>(null)
  const messenger = useRef<THREE.Group>(null)
  const v = useMemo(() => ({ fwd: new THREE.Vector3(), want: new THREE.Vector3(), look: new THREE.Vector3() }), [])
  useFrame(({ camera }, dt) => {
    const p = player.current
    car.current?.position.set(p.x, 0, p.z)
    car.current?.rotation.set(0, p.heading, 0)
    const g = ghost.current
    if (messenger.current) {
      messenger.current.visible = g !== null
      if (g) {
        messenger.current.position.set(g.x, 0, g.z)
        messenger.current.rotation.set(0, g.heading, 0)
      }
    }
    // chase camera: behind and above the car, easing after it so turns read
    v.fwd.set(Math.sin(p.heading), 0, Math.cos(p.heading))
    v.want.set(p.x, CHASE.up, p.z).addScaledVector(v.fwd, -CHASE.back)
    camera.position.lerp(v.want, 1 - Math.exp(-dt * CHASE.follow))
    v.look.set(p.x, CHASE.lookUp, p.z).addScaledVector(v.fwd, CHASE.lookAhead)
    camera.lookAt(v.look)
  })
  return (
    <>
      <group ref={car}>
        <HermesCar lod="game" speed={speed} steer={steer} />
        <ContactShadows position={[0, 0.003, 0]} scale={9} resolution={1024} blur={2.4} far={1.1} opacity={0.82} color="#0E0F11" />
      </group>
      <group ref={messenger} visible={false}>
        <GhostCar />
      </group>
    </>
  )
}

/**
 * The canvas is transparent: put the dawn sky behind it in CSS, as on the board, e.g.
 * radial-gradient(60% 40% at 74% var(--horizon), #FFF0DF, transparent),
 * linear-gradient(#C3C9D2, #ECEAE6 var(--horizon)), where --horizon is the horizon's height on screen.
 * The fog fades the far track into HORIZON, the sky's colour at the horizon.
 */
export default function TestDriveScene(props: TestDriveSceneProps) {
  return (
    <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, CHASE.up, -CHASE.back], fov: 50, near: 0.1, far: 1500 }}>
      <fog attach="fog" args={[HORIZON, 70, 620]} />
      <Suspense fallback={null}>
        <Track layout={props.layout} />
        <TrackEnvironment />
        <Cars {...props} />
      </Suspense>
    </Canvas>
  )
}
