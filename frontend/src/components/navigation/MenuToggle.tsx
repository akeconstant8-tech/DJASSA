import React, { forwardRef } from 'react';

interface MenuToggleProps {
  open: boolean;
  onToggle: () => void;
  controlsId: string;
  openLabel: string;
  closeLabel: string;
  className?: string;
}

// Bouton « hamburger » : les trois barres se transforment en croix (aria-expanded pilote l'animation CSS).
const bar = 'absolute left-1/2 -ml-[9px] w-[18px] h-[2px] rounded-full bg-current transition-[translate,rotate,opacity,scale] duration-300 ease-emphasized';

export const MenuToggle = forwardRef<HTMLButtonElement, MenuToggleProps>(function MenuToggle(
  { open, onToggle, controlsId, openLabel, closeLabel, className = '' },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-label={open ? closeLabel : openLabel}
      className={`group w-10 h-10 shrink-0 rounded-full bg-[#fffaf5] border border-[#fed7aa] text-[#0f172a] shadow-xs btn-motion ${className}`}
    >
      {/* Boîte intérieure de 38px (bordure de 1px) : barres centrées sur 13 / 19 / 25px, croisées au centre (19px) */}
      <span aria-hidden="true" className={`${bar} top-[12px] group-aria-expanded:translate-y-[6px] group-aria-expanded:rotate-45`} />
      <span aria-hidden="true" className={`${bar} top-[18px] group-aria-expanded:opacity-0 group-aria-expanded:scale-x-0`} />
      <span aria-hidden="true" className={`${bar} top-[24px] group-aria-expanded:-translate-y-[6px] group-aria-expanded:-rotate-45`} />
    </button>
  );
});
