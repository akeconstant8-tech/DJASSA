import { stagger, type Transition, type Variants } from 'motion/react';
import {
  distance,
  duration,
  ease,
  enterTransition,
  exitTransition,
  spring,
  staggerInterval
} from './tokens';

// Convention de labels partagée : "hidden" → "visible" → "exit".
// `custom` optionnel = délai d'entrée en secondes (utilisé par <Reveal delay>).
// Sans délai explicite, la clé `delay` est omise pour laisser le parent orchestrer le stagger.
const delayed = (base: Transition, delay?: number): Transition =>
  delay ? { ...base, delay } : base;

const offset = (x: number, y: number): Variants => ({
  hidden: { opacity: 0, x, y },
  visible: (delay?: number) => ({ opacity: 1, x: 0, y: 0, transition: delayed(enterTransition, delay) }),
  exit: { opacity: 0, x: x / 2, y: y / 2, transition: exitTransition }
});

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay?: number) => ({ opacity: 1, transition: delayed(enterTransition, delay) }),
  exit: { opacity: 0, transition: exitTransition }
};

export const fadeUp = offset(0, distance.md);
export const fadeDown = offset(0, -distance.md);
// slideLeft : l'élément se déplace vers la gauche (entre par la droite) ; slideRight : l'inverse.
export const slideLeft = offset(distance.lg, 0);
export const slideRight = offset(-distance.lg, 0);

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (delay?: number) => ({ opacity: 1, scale: 1, transition: delayed(enterTransition, delay) }),
  exit: { opacity: 0, scale: 0.96, transition: exitTransition }
};

// Petit rebond pour badges et icônes de succès.
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (delay?: number) => ({ opacity: 1, scale: 1, transition: delayed(spring.snappy, delay) }),
  exit: { opacity: 0, scale: 0.8, transition: exitTransition }
};

export const card: Variants = {
  hidden: { opacity: 0, y: distance.md, scale: 0.98 },
  visible: (delay?: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: delayed(enterTransition, delay)
  }),
  exit: { opacity: 0, scale: 0.98, transition: exitTransition }
};

export const staggerContainer = (interval: number = staggerInterval.base, startDelay = 0): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren: stagger(interval, { startDelay }) } }
});

export const page: Variants = {
  hidden: { opacity: 0, y: distance.sm },
  visible: { opacity: 1, y: 0, transition: enterTransition },
  exit: { opacity: 0, y: -distance.sm / 2, transition: exitTransition }
};

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.standard } },
  exit: { opacity: 0, transition: { duration: duration.base, ease: ease.standard } }
};

export const modal: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: distance.sm },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...spring.snappy, opacity: { duration: duration.fast } }
  },
  exit: { opacity: 0, scale: 0.97, y: distance.sm / 2, transition: exitTransition }
};

export const drawerRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: spring.drawer },
  exit: { x: '100%', transition: { duration: duration.base, ease: ease.exit } }
};

// À combiner avec style={{ transformOrigin }} aligné sur le déclencheur.
export const dropdown: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -distance.sm / 2 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.fast, ease: ease.emphasized } },
  exit: { opacity: 0, scale: 0.98, y: -distance.sm / 2, transition: { duration: 0.12, ease: ease.exit } }
};

export const toast: Variants = {
  hidden: { opacity: 0, y: distance.md, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, y: distance.sm, transition: exitTransition }
};

export const revealVariants = {
  fadeIn,
  fadeUp,
  fadeDown,
  slideLeft,
  slideRight,
  scaleIn,
  pop,
  card
} as const;

export type RevealVariant = keyof typeof revealVariants;
