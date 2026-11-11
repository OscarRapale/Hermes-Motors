import { HERO_SIZES, heroSrcSet } from './heroStill'

/**
 * Runs inside the head script, after the theme is chosen (`t`): on the landing page, preload the
 * visible hero still at high priority, so the LCP image starts before the CSS and the scripts.
 * AVIF only; a browser without AVIF ignores the preload and loads the WebP from the <picture>.
 */
export function heroPreloadSnippet(): string {
  const night = JSON.stringify(heroSrcSet('night', 'avif'))
  const day = JSON.stringify(heroSrcSet('day', 'avif'))
  return `if(location.pathname==='/'){var l=document.createElement('link');l.rel='preload';l.as='image';l.type='image/avif';l.setAttribute('imagesrcset',t==='day'?${day}:${night});l.setAttribute('imagesizes',${JSON.stringify(HERO_SIZES)});l.setAttribute('fetchpriority','high');l.setAttribute('data-hero-preload',t);document.head.appendChild(l)}`
}
