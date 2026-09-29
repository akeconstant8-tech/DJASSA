import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  backdrop,
  duration,
  ease,
  enterTransition,
  m,
  stagger,
  type Variants
} from '../../motion';
import { useOverlay } from '../../hooks/useOverlay';
import type { NavItem } from './types';

interface MobileMenuProps {
  id: string;
  open: boolean;
  // restoreFocus : rendre le focus au bouton menu (Échap, fond, re-sélection de la page courante).
  onClose: (restoreFocus: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
  items: NavItem[];
  activeKey: string | null;
  navLabel: string;
  children?: React.ReactNode;
}

// Le panneau puis ses éléments (liens et sections) apparaissent en cascade, dans l'ordre.
const panelVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.emphasized, delayChildren: stagger(0.045, { startDelay: 0.04 }) }
  },
  exit: { opacity: 0, y: -8, transition: { duration: duration.fast, ease: ease.exit } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: enterTransition }
};

// Panneau déroulant sous l'en-tête (écrans < 1024px). À placer dans l'en-tête, juste après sa rangée principale.
export const MobileMenu: React.FC<MobileMenuProps> = ({
  id,
  open,
  onClose,
  anchorRef,
  toggleRef,
  items,
  activeKey,
  navLabel,
  children
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  // Bas de l'en-tête : positionne le fond et limite la hauteur du panneau à l'écran.
  const [offset, setOffset] = useState(0);

  useOverlay(open, () => onClose(true));

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => setOffset(Math.max(0, anchorRef.current?.getBoundingClientRect().bottom ?? 0));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open, anchorRef]);

  // À l'ouverture, le focus va au premier lien (utile au clavier et aux lecteurs d'écran).
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => firstItemRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Le focus clavier quitte le menu (Tab au-delà du dernier élément) : on referme.
  const handleBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (!next || panelRef.current?.contains(next) || toggleRef.current?.contains(next)) return;
    onClose(false);
  };

  const sections = React.Children.toArray(children);

  return (
    <>
      <AnimatePresence>
        {open && (
          <m.div
            key="mobile-menu-panel"
            id={id}
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onBlur={handleBlur}
            style={{ maxHeight: `calc(100dvh - ${offset}px)` }}
            className="lg:hidden absolute inset-x-0 top-full overflow-y-auto overscroll-contain bg-white border-b border-[#fed7aa]/60 rounded-b-3xl shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-5 flex flex-col gap-4">
              <nav aria-label={navLabel}>
                {/* ul non animé : les li s'enregistrent directement auprès du panneau, cascade dans l'ordre */}
                <ul className="flex flex-col gap-1">
                  {items.map((item, index) => {
                    const active = item.key === activeKey;
                    return (
                      <m.li key={item.key} variants={itemVariants}>
                        <button
                          ref={index === 0 ? firstItemRef : undefined}
                          type="button"
                          onClick={item.onSelect}
                          aria-current={active ? 'page' : undefined}
                          aria-label={item.ariaLabel}
                          className={`w-full flex items-center gap-3 min-h-12 pl-4 pr-3 py-2.5 rounded-2xl text-left text-sm font-bold item-motion ${
                            active ? 'bg-[#fff7ed] text-[#ea580c]' : 'text-[#0f172a]'
                          }`}
                        >
                          {/* Indicateur de page active */}
                          <span
                            aria-hidden="true"
                            className={`absolute left-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-[#ea580c] transition-[opacity,scale] duration-300 ease-emphasized ${
                              active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                            }`}
                          />
                          <span
                            aria-hidden="true"
                            className={`material-symbols-outlined text-[22px] ${active ? 'text-[#ea580c]' : 'text-[#94a3b8]'}`}
                          >
                            {item.icon}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block truncate">{item.label}</span>
                            {item.hint && (
                              <span className="block truncate text-[11px] font-semibold text-[#64748b]">{item.hint}</span>
                            )}
                          </span>
                          {item.badge ? (
                            <span className="min-w-6 h-6 px-1.5 rounded-full bg-gradient-orange text-white text-[11px] font-extrabold flex items-center justify-center">
                              {item.badge}
                            </span>
                          ) : (
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#cbd5e1]">
                              chevron_right
                            </span>
                          )}
                        </button>
                      </m.li>
                    );
                  })}
                </ul>
              </nav>

              {sections.map((section, index) => (
                <m.div key={index} variants={itemVariants}>
                  {section}
                </m.div>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Fond sous l'en-tête, hors du header : son backdrop-filter piègerait un élément fixed. */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <m.div
              key="mobile-menu-backdrop"
              variants={backdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden="true"
              onClick={() => onClose(true)}
              style={{ top: offset }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-[#0f172a]/30"
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
