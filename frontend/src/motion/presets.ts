import type { TargetAndTransition } from 'motion/react';
import { spring } from './tokens';

// Gestes pour composants `m.*`. motion ignore le survol simulé au toucher : pas d'effet collant sur mobile.
// Pour les <button> classiques, préférer la classe CSS `btn-motion` (src/index.css).

type GesturePreset = {
  whileHover?: TargetAndTransition;
  whileTap?: TargetAndTransition;
};

export const hoverLift: GesturePreset = {
  whileHover: { y: -4, transition: spring.gentle }
};

export const pressable: GesturePreset = {
  whileHover: { scale: 1.03, transition: spring.gentle },
  whileTap: { scale: 0.95, transition: spring.snappy }
};
