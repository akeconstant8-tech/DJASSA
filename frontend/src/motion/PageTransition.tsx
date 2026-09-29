import { m, type HTMLMotionProps } from 'motion/react';
import { page } from './variants';

// À placer comme enfant direct (avec une `key` unique par vue) d'un <AnimatePresence mode="wait">.
export function PageTransition(
  props: Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'>
) {
  return <m.div variants={page} initial="hidden" animate="visible" exit="exit" {...props} />;
}
