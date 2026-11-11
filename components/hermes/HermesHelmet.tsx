'use client'
/**
 * <HermesHelmet /> — a Hermes Motors driver's helmet for React Three Fiber.
 *
 * Model   "F1 Helmet ZhouGuanyu 24" by Miopass, CC BY 4.0, modified: every original texture removed (the paint,
 *         the roughness and normal maps all carried the original design), repainted with the Hermes livery,
 *         parts regrouped, simplified, rescaled. Keep the credit on the site (docs/legal/credits.md).
 * Space   metres · +Y up · visor → +Z · origin on the ground under the centre · 274 × 280 × 374 mm
 * Parts   Shell · Visor · Trim (rear + chin spoiler) · Hardware (vents, visor pivots, HANS posts) · Lining
 * Livery  a mask baked into the shell's UVs (R the three feathers · G the trim band · B the vent wells), tinted
 *         here from HelmetLivery tokens, so one 330 KB file covers every driver, the night and the messenger.
 * Number  drawn at runtime on both sides of the chin, so it comes from content, not from the file.
 * Shadow  its own soft ellipse on the ground (the drawing's), because ContactShadows looks up from below and an
 *         open helmet shows it only back faces; pair it with <HermesStudio shadow={false} />.
 *
 * Wrap in <Suspense>: the model loads through drei's useGLTF.
 */
import * as THREE from 'three'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import { type ThreeElements } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'

export const HERMES_HELMET_MODEL = '/models/hermes-helmet.glb' // 37,991 triangles · 330 KB

export type HelmetLivery = {
  /** the paint */
  shell: string
  /** the three feathers (the mark's wings) */
  feather: string
  /** bottom band, rear spoiler and chin spoiler */
  trim: string
  visor: string
  /** colour of the chin number; null hides it */
  number: string | null
  /** draw the see-through Redline helmet instead of paint (the messenger) */
  ghost?: boolean
}

/** Brand book: Gallery White, Graphite, Carbon, Redline. Which driver wears which lives in content/drivers. */
export const HELMET_LIVERIES = {
  /** white shell, Carbon trim (the board's driver 9) */
  gallery: { shell: '#F4F4F5', feather: '#D5121E', trim: '#0E0F11', visor: '#16171A', number: '#0E0F11' },
  /** Graphite shell, Gallery White trim (the board's driver 19) */
  graphite: { shell: '#16171A', feather: '#D5121E', trim: '#F4F4F5', visor: '#3A3C42', number: '#F4F4F5' },
  /** before 06:00: dark shell, grey feathers, no number */
  beforeDawn: { shell: '#1E1F23', feather: '#2F3136', trim: '#0B0C0E', visor: '#0B0C0E', number: null },
  /** the messenger: see-through, Redline edge, like his ghost car in the test drive */
  messenger: { shell: '#16171A', feather: '#FF5A63', trim: '#16171A', visor: '#16171A', number: null, ghost: true },
} satisfies Record<string, HelmetLivery>

/** Where the number sits: the side of the chin bar, between the chin spoiler and the trim band. */
const NUMBER = { y: 0.047, z: 0.1, height: 0.056 }
const VENT = '#0B0C0E'

// ---------------------------------------------------------------- materials

function shellPaint(mask: THREE.Texture, l: HelmetLivery) {
  const m = new THREE.MeshPhysicalMaterial({ name: 'Shell', map: mask, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, side: THREE.DoubleSide })
  const uniforms = {
    uShell: { value: new THREE.Color(l.shell) },
    uFeather: { value: new THREE.Color(l.feather) },
    uTrim: { value: new THREE.Color(l.trim) },
    uVent: { value: new THREE.Color(VENT) },
  }
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms)
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uShell;\nuniform vec3 uFeather;\nuniform vec3 uTrim;\nuniform vec3 uVent;')
      .replace(
        '#include <map_fragment>',
        /* glsl */ `
#ifdef USE_MAP
  vec3 livery = texture2D( map, vMapUv ).rgb;
  vec3 paint = mix( uShell, uTrim, livery.g );
  paint = mix( paint, uFeather, livery.r );
  paint = mix( paint, uVent, livery.b );
  diffuseColor.rgb *= paint;
#endif`,
      )
  }
  m.customProgramCacheKey = () => 'hermes-helmet-shell'
  return m
}

const ghostVertex = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec2 vLiveryUv;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
#ifdef USE_LIVERY
  vLiveryUv = uv;
#endif
  gl_Position = projectionMatrix * mv;
}`
const ghostFragment = /* glsl */ `
uniform vec3 uRim;
uniform vec3 uBody;
uniform float uBodyAlpha;
uniform float uRimAlpha;
#ifdef USE_LIVERY
uniform sampler2D uMask;
uniform float uFeatherAlpha;
#endif
varying vec3 vN;
varying vec3 vV;
varying vec2 vLiveryUv;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4);
  vec3 c = mix(uBody, uRim, f);
  float a = clamp(uBodyAlpha + f * uRimAlpha, 0.0, 1.0);
#ifdef USE_LIVERY
  float fe = texture2D(uMask, vLiveryUv).r;
  c = mix(c, uRim, fe);
  a = max(a, fe * uFeatherAlpha);
#endif
  gl_FragColor = vec4(c, a);
}`

/** Same look as GhostCar: a dark see-through body with a Redline edge; the feathers glow faintly on the shell. */
function ghost(l: HelmetLivery, mask?: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uRim: { value: new THREE.Color(l.feather) },
      uBody: { value: new THREE.Color(l.shell) },
      uBodyAlpha: { value: 0.1 },
      uRimAlpha: { value: 0.7 },
      uMask: { value: mask ?? null },
      uFeatherAlpha: { value: 0.55 },
    },
    defines: mask ? { USE_LIVERY: '' } : {},
    vertexShader: ghostVertex,
    fragmentShader: ghostFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

type Part = 'Shell' | 'Visor' | 'Trim' | 'Hardware' | 'Lining'
function createMaterials(mask: THREE.Texture, l: HelmetLivery): Record<Part, THREE.Material> {
  if (l.ghost) {
    const hidden = new THREE.MeshBasicMaterial({ visible: false })
    return { Shell: ghost(l, mask), Visor: ghost(l), Trim: ghost(l), Hardware: ghost(l), Lining: hidden }
  }
  const side = THREE.DoubleSide
  return {
    Shell: shellPaint(mask, l),
    Visor: new THREE.MeshPhysicalMaterial({ name: 'Visor', color: l.visor, roughness: 0.05, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.03, side }),
    Trim: new THREE.MeshPhysicalMaterial({ name: 'Trim', color: l.trim, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, side }),
    Hardware: new THREE.MeshPhysicalMaterial({ name: 'Hardware', color: '#0E0F11', roughness: 0.45, metalness: 0.2, clearcoat: 0.4, side }),
    Lining: new THREE.MeshStandardMaterial({ name: 'Lining', color: '#1A1B1F', roughness: 0.95, side }),
  }
}

// ---------------------------------------------------------------- ground shadow

const shadowVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const shadowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float d = length((vUv - 0.5) * 2.0);
  float core = 1.0 - smoothstep(0.22, 0.64, d);   // contact under the rim
  float soft = 1.0 - smoothstep(0.30, 1.0, d);    // wide penumbra
  gl_FragColor = vec4(uColor, uOpacity * (0.6 * core + 0.4 * soft * soft));
}`
/** A soft ellipse a little larger than the 274 × 374 mm footprint; it turns with the helmet. */
function groundShadow(opacity: number) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.6).rotateX(-Math.PI / 2).translate(0, 0.0015, 0),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color('#0E0F11') }, uOpacity: { value: opacity } },
      vertexShader: shadowVertex,
      fragmentShader: shadowFragment,
      transparent: true,
      depthWrite: false,
    }),
  )
  mesh.name = 'GroundShadow'
  mesh.renderOrder = -1
  return mesh
}

// ---------------------------------------------------------------- the number

function numberTexture(text: string, fontFamily: string) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#ffffff'
  g.font = `400 168px ${fontFamily}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 256, 136)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Project the number onto each side of the chin. Returns meshes in helmet space. */
function numberDecals(shell: THREE.Mesh, root: THREE.Object3D, tex: THREE.Texture, color: string) {
  // the compressed file keeps positions quantized under the node's transform, so project in the shell's own frame
  root.updateMatrixWorld(true)
  const probe = new THREE.Mesh(shell.geometry)
  probe.matrixAutoUpdate = false
  probe.matrix.copy(root.matrixWorld).invert().multiply(shell.matrixWorld)
  probe.matrixWorld.copy(probe.matrix)
  const mat = new THREE.MeshPhysicalMaterial({
    map: tex,
    color,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  })
  const out: THREE.Mesh[] = []
  for (const side of [1, -1] as const) {
    const ray = new THREE.Raycaster(new THREE.Vector3(side * 0.4, NUMBER.y, NUMBER.z), new THREE.Vector3(-side, 0, 0))
    const hit = ray.intersectObject(probe, false)[0]
    if (!hit) continue
    // the projector's +x runs toward the back (−z) on the +x side and toward the visor (+z) on the −x side,
    // so the digits read left to right from either side
    const geo = new DecalGeometry(probe, hit.point, new THREE.Euler(0, (side * Math.PI) / 2, 0), new THREE.Vector3(NUMBER.height * 2, NUMBER.height, 0.06))
    const mesh = new THREE.Mesh(geo, mat)
    mesh.name = `Number_${side > 0 ? 'L' : 'R'}`
    mesh.renderOrder = 1
    out.push(mesh)
  }
  return out
}

// ---------------------------------------------------------------- component

export type HermesHelmetProps = Omit<ThreeElements['group'], 'children'> & {
  /** colours, or a preset from HELMET_LIVERIES */
  livery?: HelmetLivery
  /** race number on both sides of the chin; '' for none */
  number?: string
  /** CSS font-family for the number: pass next/font's `michroma.style.fontFamily` */
  fontFamily?: string
  /** soft ground shadow opacity (0 = none; the messenger never casts one) */
  shadow?: number
}

export function HermesHelmet({ livery = HELMET_LIVERIES.gallery, number = '', fontFamily = 'Michroma, sans-serif', shadow = 0.55, ...props }: HermesHelmetProps) {
  const { scene } = useGLTF(HERMES_HELMET_MODEL)
  const liveryKey = JSON.stringify(livery)
  const l = useMemo<HelmetLivery>(() => livery, [liveryKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const helmet = useMemo(() => {
    const root = scene.clone(true)
    const parts = new Map<Part, THREE.Mesh[]>()
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      // single-primitive nodes load as the mesh itself, multi-primitive ones as a group of meshes
      const part = (['Shell', 'Visor', 'Trim', 'Hardware', 'Lining'] as const).find((p) => p === m.name || p === m.parent?.name)
      if (part) parts.set(part, [...(parts.get(part) ?? []), m])
    })
    const shell = parts.get('Shell')![0]
    const mask = (shell.material as THREE.MeshStandardMaterial).map!
    // the mask is data, not colour
    if (mask.colorSpace !== THREE.NoColorSpace) {
      mask.colorSpace = THREE.NoColorSpace
      mask.anisotropy = 8
      mask.needsUpdate = true
    }
    return { root, parts, shell, mask }
  }, [scene])

  const materials = useMemo(() => createMaterials(helmet.mask, l), [helmet, l])
  useLayoutEffect(() => {
    helmet.parts.forEach((list, part) => list.forEach((m) => (m.material = materials[part])))
  }, [helmet, materials])
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])

  useLayoutEffect(() => {
    if (!shadow || l.ghost) return
    const s = groundShadow(shadow)
    helmet.root.add(s)
    return () => {
      s.removeFromParent()
      s.geometry.dispose()
      ;(s.material as THREE.Material).dispose()
    }
  }, [helmet, shadow, l.ghost])

  useEffect(() => {
    if (!number || !l.number || l.ghost) return
    let made: THREE.Mesh[] = []
    let tex: THREE.Texture | null = null
    let cancelled = false
    // draw only once the font is ready, or the canvas falls back to a system face
    document.fonts.load(`400 168px ${fontFamily}`, number).finally(() => {
      if (cancelled) return
      tex = numberTexture(number, fontFamily)
      made = numberDecals(helmet.shell, helmet.root, tex, l.number!)
      made.forEach((m) => helmet.root.add(m))
    })
    return () => {
      cancelled = true
      made.forEach((m) => {
        m.removeFromParent()
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
      tex?.dispose()
    }
  }, [helmet, number, fontFamily, l])

  return (
    <group {...props}>
      <primitive object={helmet.root} />
    </group>
  )
}

/** Start downloading before the helmets mount (e.g. when the Drivers link is hovered). */
export function preloadHermesHelmet() {
  useGLTF.preload(HERMES_HELMET_MODEL)
}
