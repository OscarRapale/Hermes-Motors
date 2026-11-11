import { DAY_ONE_MS } from '@/lib/clock/phase'
import { LED_COUNT, LED_FILL_MS, LONG_COUNTDOWN_HOURS } from '@/lib/clock/countdown'

/**
 * Inline script placed at the end of the hero, run while the page parses (before first layout):
 *
 * 1. Decision D16: both hero stills are `loading=lazy` (the hidden theme's is never fetched); the
 *    visible one is switched to eager + high priority here, so it starts at once as the LCP image.
 * 2. Writes the first countdown value and LED state, so the night panel never paints a placeholder.
 *    The live updates come from NightPanel after hydration; the maths mirrors lib/clock/countdown.
 */
export function heroScript(dayOne: number = DAY_ONE_MS): string {
  return `(function(){var d=document,t=d.documentElement.getAttribute('data-theme')==='day'?'day':'night',i=d.querySelector('[data-hero-still="'+t+'"] img');if(i){i.loading='eager';i.fetchPriority='high'}var c=d.querySelector('[data-countdown]');if(!c)return;var ms=${dayOne}-Date.now(),s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,L=h>=${LONG_COUNTDOWN_HOURS},p=function(n){return(n<10?'0':'')+n},w=function(k,v){var e=c.querySelector('[data-cd="'+k+'"]');if(e)e.textContent=v};c.setAttribute('data-format',L?'days':'hms');w('days',String(Math.floor(h/24)));w('hh',p(L?h%24:h));w('mm',p(m));w('ss',p(x));var n=Math.round(${LED_COUNT}*Math.min(1,Math.max(0,1-ms/${LED_FILL_MS}))),l=d.querySelectorAll('[data-night-leds]>*');for(var j=0;j<l.length;j++)if(j<n)l[j].setAttribute('data-on','')})()`
}
