import { m, type HTMLMotionProps } from 'motion/react';
import { revealVariants, type RevealVariant } from './variants';

type RevealProps = Omit<
  HTMLMotionProps<'div'>,
  'variants' | 'initial' | 'animate' | 'whileInView' | 'custom'
> & {
  variant?: RevealVariant;
  delay?: number;
  // true : anime à l'entrée dans le viewport (une seule fois) au lieu du montage.
  inView?: boolean;
};

export function Reveal({ variant = 'fadeUp', delay, inView = false, viewport, ...rest }: RevealProps) {
  const trigger = inView
    ? { whileInView: 'visible', viewport: { once: true, amount: 0.2, ...viewport } }
    : { animate: 'visible' };

  return (
    <m.div
      variants={revealVariants[variant]}
      custom={delay}
      initial="hidden"
      {...trigger}
      {...rest}
    />
  );
}
