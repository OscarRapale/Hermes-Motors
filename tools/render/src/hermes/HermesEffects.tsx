'use client'
/**
 * <HermesEffects /> — ambient occlusion + brand-true tone mapping for the exhibition.
 * Needs @react-three/postprocessing and postprocessing. Desktop only: leave it out on phones
 * and in the test drive. Place it inside <Canvas>, after the scene.
 */
import { EffectComposer, N8AO, SMAA, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export function HermesEffects() {
  return (
    <EffectComposer multisampling={0}>
      <N8AO aoRadius={0.22} distanceFalloff={0.3} intensity={1.8} quality="high" />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <SMAA />
    </EffectComposer>
  )
}
