import type React from 'react';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lumière de carte : à brancher sur onPointerMove d'un conteneur (délégation, aucun rendu React).
// Met à jour la position de la lueur sur la carte `.card-spotlight` survolée.
export function trackSpotlight(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const card = (e.target as HTMLElement).closest<HTMLElement>('.card-spotlight');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
  card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
}

// Vol vers le panier : la vignette du produit part du bouton et rejoint l'icône du panier
// (élément marqué data-cart-target), en arc. Web Animations API : une seule vignette, transform + opacité,
// supprimée à l'arrivée. Ignoré avec prefers-reduced-motion ou si le panier n'est pas visible.
export function flyToCart(from: HTMLElement, imageSrc: string) {
  if (prefersReducedMotion()) return;
  const target = [...document.querySelectorAll<HTMLElement>('[data-cart-target]')].find(
    (el) => el.getClientRects().length > 0
  );
  if (!target) return;

  const start = from.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  const size = 44;
  const x0 = start.left + start.width / 2 - size / 2;
  const y0 = start.top + start.height / 2 - size / 2;
  const dx = end.left + end.width / 2 - size / 2 - x0;
  const dy = end.top + end.height / 2 - size / 2 - y0;

  const thumb = document.createElement('div');
  thumb.setAttribute('aria-hidden', 'true');
  Object.assign(thumb.style, {
    position: 'fixed',
    left: `${x0}px`,
    top: `${y0}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '9999px',
    background: `#fff url("${imageSrc}") center / 80% no-repeat`,
    border: '2px solid #ea580c',
    boxShadow: '0 10px 24px -8px rgb(234 88 12 / 0.55)',
    zIndex: '60',
    pointerEvents: 'none'
  });
  document.body.appendChild(thumb);

  // Arc : la vignette monte d'abord, puis plonge vers le panier en rétrécissant.
  const lift = Math.min(-60, dy * 0.35);
  const flight = thumb.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${lift}px) scale(0.85)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.4 }
    ],
    { duration: 700, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' }
  );
  flight.onfinish = flight.oncancel = () => {
    thumb.remove();
    // Accusé de réception : l'icône du panier « avale » l'article.
    target.animate([{ scale: '1' }, { scale: '1.12' }, { scale: '1' }], {
      duration: 320,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    });
  };
}
