import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { m, spring } from '../../motion';
import type { NavItem } from './types';

interface DesktopNavProps {
  items: NavItem[];
  activeKey: string | null;
  label: string;
  className?: string;
}

// Navigation principale (grands écrans) : un indicateur glisse sous l'élément actif.
// Aucun élément actif (ex. page de paiement) : l'indicateur s'efface.
export const DesktopNav: React.FC<DesktopNavProps> = ({ items, activeKey, label, className = '' }) => {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState<{ x: number; width: number } | null>(null);
  // Première mesure sans animation : l'indicateur apparaît en place au lieu de glisser depuis la gauche.
  const hasMeasured = useRef(false);
  const labelsKey = items.map((i) => i.key + i.label).join('|');

  useLayoutEffect(() => {
    const measure = () => {
      const el = activeKey ? itemRefs.current.get(activeKey) : undefined;
      setIndicator(el ? { x: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    // Re-mesure si la largeur change (langue, chargement des polices, redimensionnement).
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [activeKey, labelsKey]);

  useEffect(() => {
    if (indicator) hasMeasured.current = true;
  }, [indicator]);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={`relative items-center gap-1 p-1 rounded-full bg-[#fffaf5] border border-[#fed7aa]/70 ${className}`}
    >
      <m.span
        aria-hidden="true"
        className="absolute left-0 top-1 bottom-1 rounded-full bg-white border border-[#fed7aa] shadow-[0_2px_8px_rgba(234,88,12,0.12)] pointer-events-none"
        initial={false}
        animate={indicator ? { x: indicator.x, width: indicator.width, opacity: 1 } : { opacity: 0 }}
        transition={hasMeasured.current ? spring.snappy : { duration: 0 }}
      />
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            ref={(el) => {
              if (el) itemRefs.current.set(item.key, el);
              else itemRefs.current.delete(item.key);
            }}
            type="button"
            onClick={item.onSelect}
            aria-current={active ? 'page' : undefined}
            aria-label={item.ariaLabel}
            className={`relative z-10 flex items-center gap-1.5 min-h-9 px-3.5 rounded-full text-xs font-bold item-motion ${
              active ? 'text-[#ea580c]' : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
