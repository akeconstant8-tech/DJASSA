import { useMemo } from 'react';
import { m, type HTMLMotionProps } from 'motion/react';
import { staggerContainer, revealVariants, type RevealVariant } from './variants';

type StaggerProps = Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'whileInView'> & {
  interval?: number;
  delay?: number;
  inView?: boolean;
};

// Conteneur d'apparition progressive : ses <StaggerItem> s'animent l'un après l'autre.
// Les éléments montés plus tard (filtres, ajouts) s'animent aussi à leur apparition.
export function Stagger({ interval, delay, inView = false, viewport, ...rest }: StaggerProps) {
  const variants = useMemo(() => staggerContainer(interval, delay), [interval, delay]);
  const trigger = inView
    ? { whileInView: 'visible', viewport: { once: true, amount: 0.1, ...viewport } }
    : { animate: 'visible' };

  return <m.div variants={variants} initial="hidden" {...trigger} {...rest} />;
}

type StaggerItemProps = Omit<HTMLMotionProps<'div'>, 'variants'> & {
  variant?: RevealVariant;
};

export function StaggerItem({ variant = 'fadeUp', ...rest }: StaggerItemProps) {
  return <m.div variants={revealVariants[variant]} {...rest} />;
}
