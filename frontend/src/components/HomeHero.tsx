import React, { useEffect, useRef } from 'react';
import {
  m,
  stagger,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
  type Variants
} from 'motion/react';
import { DJASSA_LOGO } from '../data/mockData';
import { TextReveal, duration, ease } from '../motion';
import { SmartImage } from './SmartImage';

// Instant (s) où l'intro du hero est lisible : le catalogue démarre juste après.
export const HOME_INTRO_DURATION = 0.6;

const introTransition: Transition = { duration: duration.intro, ease: ease.emphasized };

// Sans délai explicite, la clé `delay` est omise pour laisser le parent orchestrer.
const rise = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  visible: (delay?: number) => ({
    opacity: 1,
    y: 0,
    transition: delay ? { ...introTransition, delay } : introTransition
  })
});

const heroCard: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: introTransition }
};

const glow: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.6, ease: ease.emphasized, delay: 0.1 } }
};

// Onde unique autour du point orange : attire l'œil une fois, puis s'arrête.
const ping: Variants = {
  hidden: { opacity: 0, scale: 1 },
  visible: {
    opacity: [0, 0.6, 0],
    scale: [1, 1, 2.6],
    transition: { duration: 1.1, delay: 0.75, times: [0, 0.1, 1], ease: 'easeOut' }
  }
};

const badge = rise(-8);
const lineRise = rise(12);
const itemRise = rise(8);

const trustRow: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(0.08, { startDelay: 0.55 }) } }
};

const logoIn: Variants = {
  hidden: { opacity: 0, scale: 0.82, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 160,
      damping: 15,
      mass: 0.9,
      delay: 0.3,
      opacity: { duration: 0.5, delay: 0.3, ease: ease.emphasized }
    }
  }
};

interface HomeHeroProps {
  title: string;
  subtitle: string;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ title, subtitle }) => {
  const reduceMotion = useReducedMotion();

  // Parallaxe au pointeur (souris uniquement) : le logo s'incline, le halo se décale en sens inverse.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 18, mass: 0.4 });
  const logoRotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const logoRotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const glowX = useTransform(springX, [-0.5, 0.5], [16, -16]);
  const glowPointerY = useTransform(springY, [-0.5, 0.5], [16, -16]);

  // Parallaxe au défilement : le halo descend plus lentement que le contenu, la lueur de fond remonte
  // légèrement. Valeurs bornées aux 500 premiers pixels (au-delà, le hero est hors de l'écran).
  const { scrollY } = useScroll();
  const glowScrollY = useTransform(scrollY, [0, 500], reduceMotion ? [0, 0] : [0, 60]);
  const glowY = useTransform(() => glowPointerY.get() + glowScrollY.get());
  const auroraY = useTransform(scrollY, [0, 500], reduceMotion ? [0, 0] : [0, -40]);

  // La lueur animée ne tourne que lorsque le hero est à l'écran (économie de batterie).
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      hero.toggleAttribute('data-inview', entry.isIntersecting);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <m.div
      ref={heroRef}
      variants={heroCard}
      initial="hidden"
      animate="visible"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="mb-8 rounded-3xl p-6 sm:p-8 bg-gradient-dark text-white border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
    >
      {/* Lueur de fond : l'enveloppe suit le défilement, l'intérieur dérive en CSS (animations séparées). */}
      <m.div aria-hidden="true" style={{ y: auroraY }} className="absolute inset-0 pointer-events-none">
        <div className="hero-aurora" />
      </m.div>

      <m.div
        variants={glow}
        style={{ x: glowX, y: glowY }}
        className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-xl relative z-10">
        <m.span
          variants={badge}
          custom={0.15}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-[#f97316] text-xs font-extrabold shadow-xs mb-3 border border-zinc-700"
        >
          <span className="relative flex w-2 h-2">
            {!reduceMotion && (
              <m.span variants={ping} className="absolute inset-0 rounded-full bg-[#ea580c]" />
            )}
            <span className="relative w-2 h-2 rounded-full bg-[#ea580c]" />
          </span>
          <span>Djassa Market • Marketplace UEMOA 100% XOF</span>
        </m.span>

        <TextReveal
          as="h1"
          text={title}
          delay={0.25}
          className="text-2xl sm:text-4xl font-black text-white tracking-tight"
        />

        <m.p
          variants={lineRise}
          custom={0.45}
          className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed"
        >
          {subtitle}
        </m.p>

        <m.div
          variants={trustRow}
          className="flex items-center gap-3 mt-4 text-xs font-semibold text-zinc-400"
        >
          <m.span variants={itemRise} className="flex items-center gap-1 text-[#f97316]">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Vendeurs Certifiés
          </m.span>
          <m.span variants={itemRise}>•</m.span>
          <m.span variants={itemRise} className="flex items-center gap-1 text-white">
            <span className="material-symbols-outlined text-[16px] text-[#f97316]">local_shipping</span>
            Livraison 24h/48h
          </m.span>
        </m.div>
      </div>

      {/* Official Djassa Market 3D Logo Showcase */}
      <m.div variants={logoIn} className="relative z-10 shrink-0 flex items-center justify-center">
        <m.div
          style={{ rotateX: logoRotateX, rotateY: logoRotateY, transformPerspective: 700 }}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-zinc-900/90 p-2 shadow-[0_10px_30px_rgba(234,88,12,0.25)] border-2 border-[#ea580c]/50 relative group"
        >
          <SmartImage
            src={DJASSA_LOGO}
            alt="Djassa Market Official Logo"
            priority
            dark
            wrapperClassName="w-full h-full rounded-2xl"
            className="w-full h-full object-cover motion-safe:group-hover:scale-105"
          />
        </m.div>
      </m.div>
    </m.div>
  );
};
