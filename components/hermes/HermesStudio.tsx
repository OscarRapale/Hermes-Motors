'use client'
/**
 * <HermesStudio /> — the exhibition room for the HM-27. No HDR downloads: the reflections
 * come from light panels rendered once into an environment map, like a real car studio.
 *
 *   mode="day"    First light · Studio Gray room, long softbox strips (brand book: gallery)
 *   mode="night"  Before dawn · Carbon room, cold strips and a Redline glow from behind
 */
import * as THREE from 'three'
import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'

/**
 * background={false} leaves the canvas transparent (no room colour, no floor), so the page's own
 * CSS background and type show through and only the car and its contact shadow are drawn.
 */
export type StudioShadow = { scale?: number; far?: number; blur?: number; opacity?: number; resolution?: number }

export function HermesStudio({
  mode = 'day',
  floor = true,
  background = true,
  shadow = {},
}: {
  mode?: 'day' | 'night'
  floor?: boolean
  background?: boolean
  /** contact shadow overrides (defaults fit the car); false for none, e.g. under HermesHelmet, which brings its own */
  shadow?: StudioShadow | false
}) {
  const day = mode === 'day'
  const room = day ? '#E3E5E9' : '#0B0C0E'
  const gl = useThree((s) => s.gl)
  useLayoutEffect(() => {
    // Khronos PBR Neutral keeps Redline and Gallery White true to the brand book
    gl.toneMapping = THREE.NeutralToneMapping
    gl.toneMappingExposure = day ? 1.0 : 1.15
  }, [gl, day])

  return (
    <>
      {background && <color attach="background" args={[room]} />}
      <Environment resolution={512} frames={1} environmentIntensity={day ? 1 : 0.9}>
        {/* the room itself: a soft grey surround so Gallery White reads white, not grey */}
        <color attach="background" args={[day ? '#9DA1A8' : '#060607']} />
        {/* overhead softbox */}
        <Lightformer form="rect" intensity={day ? 2.2 : 1.2} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[14, 5, 1]} />
        {/* the long side strips that draw the reflection lines along the bodywork */}
        <Lightformer form="rect" intensity={day ? 3 : 5} position={[-7, 2.2, 0]} rotation-y={Math.PI / 2} scale={[18, 0.6, 1]} />
        <Lightformer form="rect" intensity={day ? 3 : 5} position={[7, 2.2, 0]} rotation-y={-Math.PI / 2} scale={[18, 0.6, 1]} />
        <Lightformer form="rect" intensity={day ? 1.4 : 2} position={[-7, 0.8, 0]} rotation-y={Math.PI / 2} scale={[18, 0.25, 1]} />
        <Lightformer form="rect" intensity={day ? 1.4 : 2} position={[7, 0.8, 0]} rotation-y={-Math.PI / 2} scale={[18, 0.25, 1]} />
        {/* front and rear fill */}
        <Lightformer form="rect" intensity={day ? 1.2 : 0.4} position={[0, 2, 9]} scale={[8, 2.5, 1]} />
        <Lightformer form="rect" intensity={day ? 0.8 : 0} position={[0, 2, -9]} rotation-y={Math.PI} scale={[8, 2.5, 1]} />
        {/* night: Redline glow from behind the car */}
        {!day && <Lightformer form="rect" color="#D5121E" intensity={1.6} position={[0, 1.2, -9]} rotation-y={Math.PI} scale={[12, 1.2, 1]} />}
        {/* night: a cold key from the front-left so the shape still reads */}
        {!day && <Lightformer form="rect" color="#C9D6FF" intensity={2.2} position={[6, 3, 7]} rotation-y={Math.PI / 4} scale={[5, 1.2, 1]} />}
        {/* floor bounce */}
        <Lightformer form="rect" color={room} intensity={day ? 0.7 : 0.15} position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[30, 30, 1]} />
      </Environment>
      {floor && background && (
        // the floor writes no depth, so the contact shadow 3 mm above it can't z-fight on low-precision depth buffers
        <mesh rotation-x={-Math.PI / 2} renderOrder={-1}>
          <circleGeometry args={[40, 96]} />
          <meshBasicMaterial color={room} toneMapped={false} depthWrite={false} />
        </mesh>
      )}
      {shadow !== false && (
        <ContactShadows
          position={[0, 0.003, 0]}
          near={-0.01} // SITE PATCH (M2): the blur plane sits at the world origin, 3 mm below this camera; with near 0 it was clipped and every blur pass wrote an empty shadow
          scale={shadow.scale ?? 10}
          resolution={shadow.resolution ?? 2048}
          blur={shadow.blur ?? 3.6}
          far={shadow.far ?? 1.2}
          opacity={(shadow.opacity ?? 0.62) * (day ? 1 : 1.45)}
          color="#0E0F11"
        />
      )}
    </>
  )
}

