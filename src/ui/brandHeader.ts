import { bindMicro, playLogo } from '@dloizides/ui-motion/logo';
import { FM } from '../i18n/fm';
import darkLockup from './brand/lockup-header-dark.svg?raw';
import lightLockup from './brand/lockup-header-light.svg?raw';
import { LOGO_INTRO, LOGO_MICRO, claimIntro } from './brand/logoMotion';
import { el } from './dom';

/** The header lockup: a home link that plays the intro once per session and the micro on hover or focus. */
export function brandHeading(dark: boolean): HTMLHeadingElement {
  const link = el('a', { class: 'brand', href: '/', 'aria-label': FM('app.title'), 'aria-description': FM('brand.homeHint'), 'data-testid': 'brand' });
  link.innerHTML = dark ? darkLockup : lightLockup;
  if (claimIntro(sessionStorage)) playLogo(link, LOGO_INTRO);
  bindMicro(link, LOGO_MICRO, 'hover');
  bindMicro(link, LOGO_MICRO, 'focus');
  return el('h1', {}, [link]);
}
