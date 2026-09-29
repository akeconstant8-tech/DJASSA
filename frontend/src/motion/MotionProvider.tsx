import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

// LazyMotion + `m.*` : ne charge que les fonctionnalités DOM utiles (animations, exit, gestes, in-view).
// `strict` lève une erreur si un composant `motion.*` complet est utilisé par erreur.
// reducedMotion="user" : si l'OS demande moins d'animations, motion rend x/y instantanés ;
// src/index.css neutralise en complément zoom et rotation. Seuls les fondus d'opacité restent.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
