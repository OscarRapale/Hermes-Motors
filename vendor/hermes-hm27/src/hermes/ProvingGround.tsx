/**
 * The Proving Ground for the test drive: a procedural road with kerbs, walls and the gantry,
 * an outdoor light rig for the car's reflections, and the messenger's ghost car.
 * Space: metres, +Y up; the player sits at the origin facing +Z; +X is the car's left.
 *
 * <Track /> with no props draws OPENING_LAYOUT, the opening straight and Turn 1 used for the
 * test-drive renders. For the full lap, pass a closed layout built from the circuit map
 * (see the design handoff), with kerbs and run-off placed by distance along the track.
 */
import * as THREE from 'three'
import { useLayoutEffect, useMemo, type ComponentProps } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei'
import { HERMES_MODELS } from './HermesCar'

export const HORIZON = '#ECEAE6'

/** Offsets across the track are in metres from the centre line; positive is the driver's left. */
export type Side = 'left' | 'right'
/** A stretch of the track, in metres along the centre line. */
export type TrackSpan = { side: Side; from: number; to?: number; segs?: number }

export type TrackLayout = {
  /** Centre-line points, metres, y = 0. */
  points: [number, number, number][]
  closed?: boolean
  /** Half the road width (the road is 14 m wide). */
  halfWidth?: number
  kerbs?: TrackSpan[]
  /** Asphalt run-off beyond the kerbs, out to 26 m. */
  runoff?: TrackSpan[]
  /** Wall offsets: graphite walls with a Redline top stripe. */
  walls?: { left: number; right: number }
  /** Where the start gantry stands; without it, it goes over the first point, square to the track. */
  gantry?: { position: [number, number, number]; yaw?: number }
}

/** Straight to the gantry, then a long right-hander: kerbs inside, at turn-in and on the exit. */
export const OPENING_LAYOUT: TrackLayout = {
  points: [
    [0, 0, -90], [0, 0, 0], [0, 0, 42], [-3, 0, 60], [-12, 0, 76], [-27, 0, 88], [-46, 0, 95], [-72, 0, 98], [-120, 0, 97], [-220, 0, 88],
  ],
  kerbs: [
    { side: 'right', from: 128, to: 176, segs: 160 },
    { side: 'left', from: 104, to: 126, segs: 80 },
    { side: 'left', from: 178, to: 214, segs: 120 },
  ],
  runoff: [{ side: 'left', from: 96, segs: 400 }],
  walls: { left: 19, right: -15 },
  gantry: { position: [0, 0, 40] },
}

export function makeTrackCurve(layout: TrackLayout) {
  return new THREE.CatmullRomCurve3(layout.points.map((p) => new THREE.Vector3(...p)), layout.closed ?? false, 'centripetal')
}

/** A strip along the track between two side offsets, from metre d0 to d1. */
export function trackStrip(curve: THREE.Curve<THREE.Vector3>, a: number, b: number, d0: number, d1: number, y: number, vPerMetre = 1, segs = 400) {
  const len = curve.getLength()
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let i = 0; i <= segs; i++) {
    const d = d0 + ((d1 - d0) * i) / segs
    const t = THREE.MathUtils.clamp(d / len, 0, 1)
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t)
    const side = new THREE.Vector3(tan.z, 0, -tan.x).normalize()
    const pa = p.clone().addScaledVector(side, a), pb = p.clone().addScaledVector(side, b)
    pos.push(pa.x, y, pa.z, pb.x, y, pb.z)
    uv.push(0, d * vPerMetre, 1, d * vPerMetre)
    if (i < segs) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/** A vertical band at one side offset, between two heights. */
export function trackWall(curve: THREE.Curve<THREE.Vector3>, o: number, y0: number, y1: number, d0: number, d1: number, segs = 300) {
  const len = curve.getLength()
  const pos: number[] = [], idx: number[] = []
  for (let i = 0; i <= segs; i++) {
    const t = THREE.MathUtils.clamp((d0 + ((d1 - d0) * i) / segs) / len, 0, 1)
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t)
    const side = new THREE.Vector3(tan.z, 0, -tan.x).normalize()
    const q = p.clone().addScaledVector(side, o)
    pos.push(q.x, y0, q.z, q.x, y1, q.z)
    if (i < segs) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  return g
}

const flat = (color: string, extra: Partial<THREE.MeshBasicMaterialParameters> = {}) =>
  new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false, ...extra })

/** Segments per metre, so long circuits keep the same smoothness as the opening stretch. */
const seg = (metres: number, perMetre: number, min: number) => Math.max(min, Math.round(metres * perMetre))

export function Track({ layout = OPENING_LAYOUT, scenery = true }: { layout?: TrackLayout; scenery?: boolean }) {
  const curve = useMemo(() => makeTrackCurve(layout), [layout])
  const tex = useTexture({ asphalt: '/track/asphalt.png', kerb: '/track/kerb.png', sign: '/track/sign.png' })
  useLayoutEffect(() => {
    for (const t of [tex.asphalt, tex.kerb]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.anisotropy = 16
    }
    for (const t of Object.values(tex)) t.colorSpace = THREE.SRGBColorSpace
    tex.sign.anisotropy = 16
    tex.asphalt.repeat.set(3.5, 1) // the road is 14 m wide and the tile 4 m long, so keep the grain square
  }, [tex])

  const len = useMemo(() => curve.getLength(), [curve])
  const parts = useMemo(() => {
    const m = {
      road: flat('#7C8189', { map: tex.asphalt }),
      line: flat('#F2F3F5'),
      kerb: flat('#FFFFFF', { map: tex.kerb }),
      runoff: flat('#C7CBD1'),
      wall: flat('#2A2C31'),
      stripe: flat('#D5121E'),
    }
    const hw = layout.halfWidth ?? 7
    const sign = (s: Side) => (s === 'left' ? 1 : -1)
    const road = seg(len, 1.8, 700)
    const out: { g: THREE.BufferGeometry; m: THREE.Material }[] = [
      { g: trackStrip(curve, -hw, hw, 0, len, 0, 1 / 4, road), m: m.road },
      { g: trackStrip(curve, hw - 0.6, hw - 0.35, 0, len, 0.004, 1, road), m: m.line },
      { g: trackStrip(curve, -(hw - 0.35), -(hw - 0.6), 0, len, 0.004, 1, road), m: m.line },
    ]
    for (const k of layout.kerbs ?? []) {
      const to = k.to ?? len
      const [a, b] = k.side === 'left' ? [hw, hw + 1.2] : [-(hw + 1.4), -hw]
      out.push({ g: trackStrip(curve, a, b, k.from, to, 0.006, 1 / 2.6, k.segs ?? seg(to - k.from, 3.4, 40)), m: m.kerb })
    }
    for (const r of layout.runoff ?? []) {
      const to = r.to ?? len
      const s = sign(r.side)
      const [a, b] = s > 0 ? [hw + 1.2, 26] : [-26, -(hw + 1.4)]
      out.push({ g: trackStrip(curve, a, b, r.from, to, 0.002, 1, r.segs ?? seg(to - r.from, 1.4, 40)), m: m.runoff })
    }
    const walls = layout.walls ?? { left: 19, right: -15 }
    const wsegs = seg(len, 1.5, 600)
    for (const o of [walls.left, walls.right]) {
      const inset = o > 0 ? -0.04 : 0.04
      out.push({ g: trackWall(curve, o, 0, 1.05, 0, len, wsegs), m: m.wall })
      out.push({ g: trackWall(curve, o + inset, 0.86, 1.05, 0, len, wsegs), m: m.stripe })
    }
    return out
  }, [curve, len, tex, layout])

  const gantry = useMemo(() => {
    if (layout.gantry) return { position: new THREE.Vector3(...layout.gantry.position), yaw: layout.gantry.yaw ?? 0 }
    const tan = curve.getTangentAt(0)
    return { position: curve.getPointAt(0), yaw: Math.atan2(tan.x, tan.z) }
  }, [curve, layout.gantry])

  const gl = useThree((s) => s.gl)
  useLayoutEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping
  }, [gl])
  const shade = useMemo(
    () => ({
      block: new THREE.MeshLambertMaterial({ color: '#CDD1D7' }),
      glass: new THREE.MeshLambertMaterial({ color: '#2A2C31' }),
      red: new THREE.MeshLambertMaterial({ color: '#D5121E' }),
      far: new THREE.MeshLambertMaterial({ color: '#B4BAC3', side: THREE.DoubleSide }),
    }),
    [],
  )

  return (
    <group>
      <hemisphereLight args={['#FFFFFF', '#B9BEC6', 1.7]} />
      <directionalLight position={[-30, 40, -25]} intensity={1.5} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} material={flat('#D9DCE1')}>
        <circleGeometry args={[1400, 64]} />
      </mesh>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.g} material={p.m} />
      ))}
      <group position={gantry.position} rotation-y={gantry.yaw}>
        <Gantry sign={tex.sign} />
      </group>
      {scenery && (
        <>
          {/* pit building and tower on the left, a grandstand on the right, a far skyline to break the horizon */}
          <mesh position={[35, 3.2, 18]} material={shade.block}>
            <boxGeometry args={[10, 6.4, 96]} />
          </mesh>
          <mesh position={[29.9, 4.2, 18]} material={shade.glass}>
            <boxGeometry args={[0.2, 1.8, 94]} />
          </mesh>
          <mesh position={[29.85, 6.25, 18]} material={shade.red}>
            <boxGeometry args={[0.25, 0.3, 96]} />
          </mesh>
          <mesh position={[37, 9.5, 78]} material={shade.block}>
            <boxGeometry args={[9, 19, 9]} />
          </mesh>
          <mesh position={[32.4, 16.2, 78]} material={shade.glass}>
            <boxGeometry args={[0.2, 3.4, 8]} />
          </mesh>
          <mesh position={[-31, 2.8, 26]} material={shade.block}>
            <boxGeometry args={[9, 5.6, 64]} />
          </mesh>
          <mesh position={[-26.4, 3.3, 26]} material={shade.glass}>
            <boxGeometry args={[0.2, 3.4, 62]} />
          </mesh>
          <mesh position={[0, 7, 0]} material={shade.far}>
            <cylinderGeometry args={[380, 380, 14, 64, 1, true]} />
          </mesh>
        </>
      )}
    </group>
  )
}

function Gantry({ sign }: { sign: THREE.Texture }) {
  const dark = flat('#16171A')
  return (
    <group>
      <mesh position={[10.4, 3.6, 0]} material={dark}>
        <boxGeometry args={[0.7, 7.2, 0.7]} />
      </mesh>
      <mesh position={[-10.4, 3.6, 0]} material={dark}>
        <boxGeometry args={[0.7, 7.2, 0.7]} />
      </mesh>
      <mesh position={[0, 6.7, 0]} material={dark}>
        <boxGeometry args={[21.5, 1.3, 0.8]} />
      </mesh>
      {/* the sign faces the oncoming cars (-Z); flipped so it reads left to right from the chase camera */}
      <mesh position={[0, 6.7, -0.41]} rotation-y={Math.PI} material={flat('#FFFFFF', { map: sign, side: THREE.FrontSide })}>
        <planeGeometry args={[18, 1.125]} />
      </mesh>
    </group>
  )
}

/** Outdoor reflections for the car: a bright sky, a warm dawn horizon ahead, long side strips. */
export function TrackEnvironment() {
  const gl = useThree((s) => s.gl)
  useLayoutEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping
    gl.toneMappingExposure = 1
  }, [gl])
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#A9AFB8']} />
      <Lightformer form="rect" intensity={2.4} position={[0, 14, 0]} rotation-x={Math.PI / 2} scale={[50, 50, 1]} />
      <Lightformer form="rect" color="#FFE6CF" intensity={2.6} position={[0, 2.5, 30]} scale={[50, 5, 1]} />
      <Lightformer form="rect" intensity={1.3} position={[0, 2.5, -30]} rotation-y={Math.PI} scale={[50, 5, 1]} />
      <Lightformer form="rect" intensity={1.8} position={[-24, 3, 0]} rotation-y={Math.PI / 2} scale={[70, 2.5, 1]} />
      <Lightformer form="rect" intensity={1.8} position={[24, 3, 0]} rotation-y={-Math.PI / 2} scale={[70, 2.5, 1]} />
      <Lightformer form="rect" color="#33363B" intensity={0.7} position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[80, 80, 1]} />
    </Environment>
  )
}

const ghostVertex = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`
const ghostFragment = /* glsl */ `
uniform vec3 uRim;
uniform vec3 uBody;
uniform float uBodyAlpha;
uniform float uRimAlpha;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4);
  gl_FragColor = vec4(mix(uBody, uRim, f), clamp(uBodyAlpha + f * uRimAlpha, 0.0, 1.0));
}`

/** The messenger: the test driver's lap, drawn as a see-through car with a Redline edge. */
export function GhostCar(props: ComponentProps<'group'>) {
  const { scene } = useGLTF(HERMES_MODELS.game)
  const ghost = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uRim: { value: new THREE.Color('#FF5A63') },
        uBody: { value: new THREE.Color('#16171A') },
        uBodyAlpha: { value: 0.08 },
        uRimAlpha: { value: 0.62 },
      },
      vertexShader: ghostVertex,
      fragmentShader: ghostFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) m.material = mat
    })
    return c
  }, [scene])
  return (
    <group {...props}>
      <primitive object={ghost} />
    </group>
  )
}
