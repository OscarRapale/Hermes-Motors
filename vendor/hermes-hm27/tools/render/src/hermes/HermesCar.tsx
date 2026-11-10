'use client'
/**
 * <HermesCar /> — the Hermes Motors HM-27 for React Three Fiber.
 *
 * Model   "2026 F1 CAR" by Abu Saif, CC BY 4.0, modified (see README). Keep the credit on the site.
 * Space   metres · +Y up · nose → +Z · origin on the ground at the centre of the 3,400 mm wheelbase
 * Parts   Body · Halo · FrontWing · RearWing · Floor · Suspension · Wheel_FL/FR/RL/RR (+X is the car's left)
 * Wheels  Wheel_XX is the hub pivot (steer = rotation.y) › Wheel_XX_Spin rolls (rotation.x)
 *
 * Wrap in <Suspense>: the model and the livery textures load through drei's useGLTF/useTexture.
 */
import * as THREE from 'three'
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { FIRST_LIGHT, type Livery } from './livery'

export const HERMES_MODELS = {
  hero: '/models/hermes-hm27.glb', // 279,590 triangles · landing exhibition
  game: '/models/hermes-hm27-game.glb', // 49,521 triangles · test drive and phones
} as const

export const HERMES_TEXTURES = {
  markH: '/livery/mark-h.png',
  markFeathers: '/livery/mark-feathers.png',
  mark: '/livery/mark.png',
  slipstream: '/livery/slipstream.png',
  hm27: '/livery/hm27.png',
  hermes: '/livery/hermes.png',
} as const

export const WHEEL_RADIUS = 0.3323 // metres
export const PART_NAMES = ['Body', 'Halo', 'FrontWing', 'RearWing', 'Floor', 'Suspension', 'Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR'] as const
export type PartName = (typeof PART_NAMES)[number]

/** Where each part travels at explode = 1 (metres, car space). The floor stays on the ground. */
export const EXPLODE_OFFSETS: Record<PartName, [number, number, number]> = {
  Floor: [0, 0, 0],
  Body: [0, 0.38, 0],
  Suspension: [0, 0.38, 0],
  Halo: [0, 1.0, 0],
  FrontWing: [0, 0.12, 1.05],
  RearWing: [0, 0.68, -1.0],
  Wheel_FL: [0.75, 0, 0.1],
  Wheel_FR: [-0.75, 0, 0.1],
  Wheel_RL: [0.75, 0, -0.1],
  Wheel_RR: [-0.75, 0, -0.1],
}

/** When each part moves during the explode: [start, end] as fractions of 0..1. The part eases out inside its window. */
export type ExplodeStagger = Partial<Record<PartName, [number, number]>>

const T = 1 / 3
/** The specs section, one chapter per third: the wings, then the halo, then body, suspension and wheels come off the floor. */
export const HERMES_SPEC_STAGGER: ExplodeStagger = {
  FrontWing: [0, T],
  RearWing: [0, T],
  Halo: [T, 2 * T],
  Body: [2 * T, 1],
  Suspension: [2 * T, 1],
  Wheel_FL: [2 * T, 1],
  Wheel_FR: [2 * T, 1],
  Wheel_RL: [2 * T, 1],
  Wheel_RR: [2 * T, 1],
}

const easeOutCubic = (u: number) => 1 - (1 - u) ** 3

/** A part's own progress for a given explode value. */
export function partExplode(e: number, span?: [number, number], ease: (u: number) => number = easeOutCubic) {
  if (!span) return e
  const u = THREE.MathUtils.clamp((e - span[0]) / Math.max(1e-6, span[1] - span[0]), 0, 1)
  return ease(u)
}

// ---------------------------------------------------------------- livery decals

type Tint = 'ink' | 'accent' | 'onCarbon' | 'onAccent'
export type DecalSpec = {
  texture: keyof typeof HERMES_TEXTURES
  /** mesh the artwork is projected onto */
  target: string
  /** [height, position along the car] in car space; placed on both flanks */
  at: [number, number]
  /** metres; height follows the artwork's proportions */
  width: number
  tint: Tint
  /** 'flies': artwork moves toward its right edge (the mark) · 'trails': toward its left (slipstream) · 'text': never mirrored */
  art: 'flies' | 'trails' | 'text'
  /** degrees the artwork climbs toward the rear */
  rise?: number
  /** projection depth in metres (keep small so thin parts don't print through) */
  depth?: number
}

/** Brand book 04 · Livery. Marks always fly forward, so they flip on the left flank. */
export const HERMES_DECAL_LAYOUT: DecalSpec[] = [
  // winged H high on the engine cover, right behind the airbox
  { texture: 'markH', target: 'Body_Paint', at: [0.93, -0.62], width: 0.3, tint: 'ink', art: 'flies' },
  { texture: 'markFeathers', target: 'Body_Paint', at: [0.93, -0.62], width: 0.3, tint: 'accent', art: 'flies' },
  // slipstream: three feathers along the flat of the sidepod, falling at 14 degrees
  { texture: 'slipstream', target: 'Body_Paint', at: [0.47, -0.1], width: 0.8, tint: 'accent', art: 'trails', depth: 0.3 },
  // car name set along the nose line
  { texture: 'hm27', target: 'Body_Paint', at: [0.5, 0.98], width: 0.32, tint: 'ink', art: 'text', rise: 14, depth: 0.25 },
  // wordmark on the carbon band, ahead of the rear wheel
  { texture: 'hermes', target: 'Body_Carbon', at: [0.18, -0.62], width: 0.55, tint: 'onCarbon', art: 'text', depth: 0.2 },
  // reverse mark: white H on the red rear-wing endplates
  { texture: 'mark', target: 'RearWing_Accent', at: [0.7, -2.28], width: 0.24, tint: 'onAccent', art: 'flies' },
]

// ---------------------------------------------------------------- materials

type Role = 'Paint' | 'Carbon' | 'Accent' | 'Tyre' | 'Rim' | 'Metal' | 'Light'

/** Shader hook shared by tyre and rim: object space is the hub frame (axle along X). */
function hubShader(mat: THREE.MeshPhysicalMaterial, key: string, uniforms: Record<string, THREE.IUniform<THREE.Color>>, color: string, metal = '') {
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms)
    const decl = Object.keys(uniforms).map((k) => `uniform vec3 ${k};`).join('\n')
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vHub;\nvarying vec3 vHubN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvHub = position;\nvHubN = normal;')
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vHub;\nvarying vec3 vHubN;\n${decl}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${color}`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>\n${metal}`)
  }
  mat.customProgramCacheKey = () => key
  return mat
}

function createMaterials(l: Livery): Record<Role, THREE.Material> {
  const side = THREE.DoubleSide
  const tyre = hubShader(
    new THREE.MeshPhysicalMaterial({ name: 'Tyre', color: l.tyre, roughness: 0.82, metalness: 0, side }),
    'hermes-tyre',
    { uRing: { value: new THREE.Color(l.accent) } },
    /* glsl */ `
    float hr = length(vHub.yz);
    float haa = max(fwidth(hr), 1e-4) * 1.2;
    float ring = smoothstep(0.274 - haa, 0.274 + haa, hr) - smoothstep(0.288 - haa, 0.288 + haa, hr);
    float wall = smoothstep(0.6, 0.85, abs(normalize(vHubN).x));
    diffuseColor.rgb = mix(diffuseColor.rgb, uRing, clamp(ring, 0.0, 1.0) * wall);`,
  )
  const rim = hubShader(
    new THREE.MeshPhysicalMaterial({ name: 'Rim', color: l.rim, roughness: 0.3, metalness: 0.75, clearcoat: 0.6, clearcoatRoughness: 0.1, side }),
    'hermes-rim',
    { uHub: { value: new THREE.Color(l.accent) }, uSteel: { value: new THREE.Color(l.steel) } },
    /* glsl */ `
    float hr = length(vHub.yz);
    float haa = max(fwidth(hr), 1e-4) * 1.2;
    float face = smoothstep(0.6, 0.85, abs(normalize(vHubN).x));
    float hubDot = (1.0 - smoothstep(0.04 - haa, 0.04 + haa, hr)) * face;
    float line = clamp(smoothstep(0.17 - haa, 0.17 + haa, hr) - smoothstep(0.176 - haa, 0.176 + haa, hr), 0.0, 1.0) * face;
    diffuseColor.rgb = mix(diffuseColor.rgb, uSteel, line);
    diffuseColor.rgb = mix(diffuseColor.rgb, uHub, hubDot);`,
    'metalnessFactor = mix(metalnessFactor, 0.0, hubDot);',
  )
  return {
    Paint: new THREE.MeshPhysicalMaterial({ name: 'Paint', color: l.paint, roughness: 0.26, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, side }),
    Carbon: new THREE.MeshPhysicalMaterial({ name: 'Carbon', color: l.carbon, roughness: 0.32, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, side }),
    Accent: new THREE.MeshPhysicalMaterial({ name: 'Accent', color: l.accent, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, side }),
    Metal: new THREE.MeshStandardMaterial({ name: 'Metal', color: l.metal, roughness: 0.3, metalness: 1, side }),
    Light: new THREE.MeshStandardMaterial({ name: 'Light', color: l.accent, emissive: l.light, emissiveIntensity: 2.5, toneMapped: false, side }),
    Tyre: tyre,
    Rim: rim,
  }
}

// ---------------------------------------------------------------- scene preparation

type Prepared = {
  root: THREE.Object3D
  parts: Partial<Record<PartName, THREE.Object3D>>
  rest: Partial<Record<PartName, THREE.Vector3>>
  spin: THREE.Object3D[]
  steer: THREE.Object3D[]
  meshes: Map<string, THREE.Mesh>
}

const bakedWheels = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>()

/** Wheels ship quantised; bake the node transform so object space = hub space (used by spin + shaders). */
function bakeToHub(mesh: THREE.Mesh) {
  mesh.updateMatrix()
  let g = bakedWheels.get(mesh.geometry)
  if (!g) {
    const src = mesh.geometry
    const pos = src.getAttribute('position')
    const nor = src.getAttribute('normal')
    const P = new Float32Array(pos.count * 3)
    const N = new Float32Array(pos.count * 3)
    const v = new THREE.Vector3()
    const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrix)
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrix).toArray(P, i * 3)
      if (nor) v.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize().toArray(N, i * 3)
    }
    g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(P, 3))
    if (nor) g.setAttribute('normal', new THREE.BufferAttribute(N, 3))
    g.setIndex(src.getIndex())
    g.computeBoundingSphere()
    bakedWheels.set(src, g)
  }
  mesh.geometry = g
  mesh.position.set(0, 0, 0)
  mesh.quaternion.identity()
  mesh.scale.set(1, 1, 1)
}

function prepare(source: THREE.Object3D): Prepared {
  const root = source.clone(true)
  const out: Prepared = { root, parts: {}, rest: {}, spin: [], steer: [], meshes: new Map() }
  root.traverse((o) => {
    if ((PART_NAMES as readonly string[]).includes(o.name)) {
      out.parts[o.name as PartName] = o
      out.rest[o.name as PartName] = o.position.clone()
    }
    if (o.name.endsWith('_Spin')) out.spin.push(o)
    if (o.name === 'Wheel_FL' || o.name === 'Wheel_FR') out.steer.push(o)
    const m = o as THREE.Mesh
    if (m.isMesh) {
      m.userData.role = (m.material as THREE.Material).name as Role
      m.castShadow = true
      m.receiveShadow = true
      out.meshes.set(m.name, m)
    }
  })
  for (const s of out.spin) for (const c of s.children) if ((c as THREE.Mesh).isMesh) bakeToHub(c as THREE.Mesh)
  return out
}

// ---------------------------------------------------------------- decal projection

const ray = new THREE.Raycaster()

/** Project one decal onto one flank. Geometry comes back in car space. */
function projectDecal(target: THREE.Mesh, carInverse: THREE.Matrix4, spec: DecalSpec, side: 1 | -1, aspect: number) {
  const saved = target.matrixWorld.clone()
  target.matrixWorld.multiplyMatrices(carInverse, saved)
  try {
    const n = new THREE.Vector3(side, 0, 0)
    ray.set(new THREE.Vector3(side * 3, spec.at[0], spec.at[1]), n.clone().negate())
    ray.far = 6
    const hit = ray.intersectObject(target, false)[0]
    if (!hit) return null
    const up = new THREE.Vector3(0, 1, 0)
    const right = new THREE.Vector3().crossVectors(up, n).normalize() // the artwork's +u
    const uForward = right.z > 0
    const roll = spec.rise ? THREE.MathUtils.degToRad(spec.rise) * (uForward ? -1 : 1) : 0
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, n))
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll))
    const size = new THREE.Vector3(spec.width, spec.width / aspect, spec.depth ?? 0.08)
    const geo = new DecalGeometry(target, hit.point, new THREE.Euler().setFromQuaternion(q), size)
    const mirror = spec.art === 'flies' ? !uForward : spec.art === 'trails' ? uForward : false
    faceOutward(geo, n, mirror)
    return geo
  } finally {
    target.matrixWorld.copy(saved)
  }
}

/** Point every decal face out of the flank (thin single-skin panels) and mirror u when needed. */
function faceOutward(geo: THREE.BufferGeometry, n: THREE.Vector3, mirrorU: boolean) {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const nor = geo.getAttribute('normal') as THREE.BufferAttribute
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), f = new THREE.Vector3()
  const swap = (attr: THREE.BufferAttribute, i: number, j: number) => {
    for (let k = 0; k < attr.itemSize; k++) {
      const t = attr.getComponent(i, k)
      attr.setComponent(i, k, attr.getComponent(j, k))
      attr.setComponent(j, k, t)
    }
  }
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i)
    b.fromBufferAttribute(pos, i + 1)
    c.fromBufferAttribute(pos, i + 2)
    f.subVectors(c, b).cross(a.sub(b))
    if (f.dot(n) < 0) {
      swap(pos, i + 1, i + 2)
      swap(nor, i + 1, i + 2)
      swap(uv, i + 1, i + 2)
    }
  }
  for (let i = 0; i < nor.count; i++) {
    f.fromBufferAttribute(nor, i)
    if (f.dot(n) < 0) nor.setXYZ(i, -f.x, -f.y, -f.z)
  }
  if (mirrorU) for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
}

function partOf(o: THREE.Object3D): THREE.Object3D {
  let p: THREE.Object3D | null = o
  while (p && !(PART_NAMES as readonly string[]).includes(p.name)) p = p.parent
  return p ?? o
}

// ---------------------------------------------------------------- component

export type HermesCarProps = Omit<ThreeElements['group'], 'children'> & {
  /** 'hero' for the landing exhibition, 'game' for the test drive and phones */
  lod?: keyof typeof HERMES_MODELS
  /** colour overrides (or a whole preset from ./livery) */
  livery?: Partial<Livery>
  /** projected livery graphics; off = plain colour blocks */
  decals?: boolean
  layout?: DecalSpec[]
  /** road speed in m/s; spins the wheels */
  speed?: RefObject<number>
  /** front-wheel angle in radians; positive turns left */
  steer?: RefObject<number>
  /** 0 = assembled, 1 = exploded; pass a ref to drive it from scroll or GSAP without re-rendering */
  explode?: number | RefObject<number>
  /** how quickly parts ease toward the explode value (higher = snappier, 0 = instant) */
  explodeDamping?: number
  /** move parts one after another instead of together (see HERMES_SPEC_STAGGER) */
  stagger?: ExplodeStagger
  /** easing inside each stagger window (default ease-out cubic; pass (u) => u when your timeline eases) */
  staggerEase?: (u: number) => number
  /** called once the parts exist, for your own GSAP timelines (keep explode at 0 while you animate them) */
  onReady?: (parts: Partial<Record<PartName, THREE.Object3D>>) => void
}

export function HermesCar({
  lod = 'hero',
  livery,
  decals = true,
  layout = HERMES_DECAL_LAYOUT,
  speed,
  steer,
  explode = 0,
  explodeDamping = 6,
  stagger,
  staggerEase,
  onReady,
  ...props
}: HermesCarProps) {
  const { scene } = useGLTF(HERMES_MODELS[lod])
  const textures = useTexture(HERMES_TEXTURES)
  const liveryKey = JSON.stringify(livery ?? {})
  const l = useMemo<Livery>(() => ({ ...FIRST_LIGHT, ...livery }), [liveryKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const car = useMemo(() => prepare(scene), [scene])
  const materials = useMemo(() => createMaterials(l), [l])

  useLayoutEffect(() => {
    for (const t of Object.values(textures)) {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
    }
  }, [textures])

  useLayoutEffect(() => {
    car.meshes.forEach((m) => {
      const mat = materials[m.userData.role as Role]
      if (mat) m.material = mat
    })
  }, [car, materials])
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])

  useLayoutEffect(() => {
    if (!decals) return
    const made: THREE.Mesh[] = []
    // project in the rest pose, then put the parts back where they were
    const posed = PART_NAMES.map((k) => car.parts[k]?.position.clone())
    for (const k of PART_NAMES) car.parts[k]?.position.copy(car.rest[k]!)
    car.root.updateMatrixWorld(true)
    const carInverse = new THREE.Matrix4().copy(car.root.matrixWorld).invert()
    for (const spec of layout) {
      const target = car.meshes.get(spec.target)
      const tex = textures[spec.texture]
      if (!target || !tex) continue
      const img = tex.image as { width: number; height: number }
      const part = partOf(target)
      const partFromCar = new THREE.Matrix4().copy(part.matrixWorld).invert().multiply(car.root.matrixWorld)
      for (const side of [1, -1] as const) {
        const geo = projectDecal(target, carInverse, spec, side, img.width / img.height)
        if (!geo) continue
        geo.applyMatrix4(partFromCar)
        const mat = new THREE.MeshPhysicalMaterial({
          map: tex,
          color: l[spec.tint],
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
          roughness: 0.28,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.name = `Decal_${spec.texture}_${side > 0 ? 'L' : 'R'}`
        mesh.renderOrder = 1
        part.add(mesh)
        made.push(mesh)
      }
    }
    PART_NAMES.forEach((k, i) => posed[i] && car.parts[k]?.position.copy(posed[i]))
    return () =>
      made.forEach((m) => {
        m.removeFromParent()
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
  }, [car, textures, l, decals, layout])

  const offsets = useMemo(() => Object.fromEntries(PART_NAMES.map((k) => [k, new THREE.Vector3(...EXPLODE_OFFSETS[k])])) as Record<PartName, THREE.Vector3>, [])

  useLayoutEffect(() => onReady?.(car.parts), [car, onReady])

  const eased = useRef(-1) // -1 = nothing applied yet
  useFrame((_, dt) => {
    const target = typeof explode === 'number' ? explode : (explode?.current ?? 0)
    const prev = eased.current
    const e = prev < 0 || explodeDamping <= 0 ? target : THREE.MathUtils.damp(prev, target, explodeDamping, Math.min(dt, 0.1))
    if (Math.abs(e - prev) > 1e-5) {
      // only touch the parts while explode is moving, so your own animations of them aren't overwritten
      eased.current = Math.abs(e - target) < 1e-4 ? target : e
      for (const k of PART_NAMES) {
        const p = car.parts[k]
        if (p) p.position.copy(car.rest[k]!).addScaledVector(offsets[k], partExplode(eased.current, stagger?.[k], staggerEase))
      }
    }
    const v = speed?.current ?? 0
    if (v) for (const s of car.spin) s.rotation.x += (v / WHEEL_RADIUS) * Math.min(dt, 0.1)
    if (steer) for (const s of car.steer) s.rotation.y = steer.current ?? 0
  })

  return (
    <group {...props}>
      <primitive object={car.root} />
    </group>
  )
}

/** Start downloading before the car mounts (e.g. preloadHermesCar('game') when the Test drive button appears). */
export function preloadHermesCar(lod: keyof typeof HERMES_MODELS = 'hero') {
  useGLTF.preload(HERMES_MODELS[lod])
  useTexture.preload(Object.values(HERMES_TEXTURES))
}
