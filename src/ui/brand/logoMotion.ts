import type { LogoTimeline } from '@dloizides/ui-motion/logo';
import motion from './motion.json';

export const LOGO_INTRO = motion.intro as LogoTimeline;
export const LOGO_MICRO = motion.micro.beats as LogoTimeline;

const INTRO_KEY = 'flier-studio.logo-intro-played';

/** True the first time in a session; marks the intro as played. */
export function claimIntro(storage: Pick<Storage, 'getItem' | 'setItem'>): boolean {
  if (storage.getItem(INTRO_KEY) !== null) return false;
  storage.setItem(INTRO_KEY, '1');
  return true;
}
