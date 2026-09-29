import type { Transition } from 'motion/react';

// Valeurs miroirs des variables CSS de src/index.css (--ease-*, --motion-duration-*).
// Toute modification doit être faite des deux côtés.

type Bezier = readonly [number, number, number, number];

export const ease = {
  emphasized: [0.22, 1, 0.36, 1],
  standard: [0.4, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
} as const satisfies Record<string, Bezier>;

// Secondes (convention motion).
export const duration = {
  fast: 0.16,
  base: 0.28,
  slow: 0.42,
  // Séquences d'introduction (hero) : plus lentes pour un rendu premium.
  intro: 0.7,
} as const;

export const distance = {
  sm: 8,
  md: 16,
  lg: 32,
} as const;

export const staggerInterval = {
  fast: 0.035,
  base: 0.06,
  slow: 0.1,
} as const;

export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 32, mass: 0.7 },
  gentle: { type: 'spring', stiffness: 300, damping: 26 },
  drawer: { type: 'spring', stiffness: 380, damping: 40 },
} as const satisfies Record<string, Transition>;

export const enterTransition: Transition = { duration: duration.base, ease: ease.emphasized };
export const exitTransition: Transition = { duration: duration.fast, ease: ease.exit };
