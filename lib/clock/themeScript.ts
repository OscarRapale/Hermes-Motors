import { DAY_ONE_MS } from './phase'
import { PREVIEW_KEY } from './preview'

/**
 * The inline <head> script (ARCHITECTURE §4.2). No dependencies; runs before first paint and sets
 * <html data-phase data-theme [data-preview]> from Date.now() and the stored preview, so the page
 * never flashes the wrong theme. Keep it in sync with lib/clock/client.ts (applyToDocument).
 *
 * `then` is extra code that runs right after, with the chosen theme in `t` (e.g. the landing's
 * preload of the visible hero still, lib/landing/heroPreload).
 */
export function themeScript(dayOne: number = DAY_ONE_MS, then = ''): string {
  return `(function(){var d=document.documentElement,p=Date.now()<${dayOne}?'before':'firstLight',t=p==='before'?'night':'day',v=null;try{v=sessionStorage.getItem('${PREVIEW_KEY}')}catch(e){}if(v==='day'||v==='night'){if(v!==t){t=v;d.setAttribute('data-preview','')}else{try{sessionStorage.removeItem('${PREVIEW_KEY}')}catch(e){}}}d.setAttribute('data-phase',p);d.setAttribute('data-theme',t);${then}})()`
}
