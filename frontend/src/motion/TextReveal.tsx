import { Fragment, createElement, useMemo } from 'react';
import { m, stagger, type Variants } from 'motion/react';
import { duration, ease } from './tokens';

type TextRevealProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  interval?: number;
};

const word: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { duration: duration.intro, ease: ease.emphasized } }
};

// Révèle un texte mot par mot, chaque mot montant derrière un masque.
// Le texte complet reste exposé aux lecteurs d'écran via aria-label.
// Clés par index : changer de langue met à jour le texte sans rejouer l'animation.
export function TextReveal({ text, as = 'span', className, delay = 0, interval = 0.08 }: TextRevealProps) {
  const container = useMemo<Variants>(
    () => ({
      hidden: {},
      visible: { transition: { delayChildren: stagger(interval, { startDelay: delay }) } }
    }),
    [delay, interval]
  );
  const words = text.split(' ');

  return createElement(
    as,
    { className, 'aria-label': text },
    <m.span variants={container} initial="hidden" animate="visible" aria-hidden="true" className="block">
      {words.map((w, i) => (
        <Fragment key={i}>
          {/* pb/-mb : évite de rogner les jambages (g, p) sous le masque */}
          <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
            <m.span variants={word} className="inline-block">
              {w}
            </m.span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </m.span>
  );
}
