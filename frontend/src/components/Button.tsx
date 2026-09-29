import React, { forwardRef, useState } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  // Texte affiché (et annoncé aux lecteurs d'écran) pendant le chargement.
  loadingText?: string;
};

// Bouton principal : garde les classes et le onClick fournis, et ajoute
// - les états survol / appui / focus / désactivé (classe CSS btn-motion, src/index.css) ;
// - un état de chargement sans saut de largeur, qui reste focusable (aria-disabled plutôt que disabled) ;
// - un état « appuyé » identique au doigt, au stylet, à la souris et au clavier (Entrée / Espace),
//   car :active seul n'est pas fiable au toucher selon les navigateurs.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    loading = false,
    loadingText,
    disabled,
    onClick,
    onKeyDown,
    onKeyUp,
    onBlur,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const [pressed, setPressed] = useState(false);
  const interactive = !disabled && !loading;

  const release = () => setPressed(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (interactive && (e.key === 'Enter' || e.key === ' ')) setPressed(true);
    onKeyDown?.(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    release();
    onKeyUp?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    release();
    onBlur?.(e);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (interactive && e.isPrimary) setPressed(true);
    onPointerDown?.(e);
  };

  // pointercancel : le navigateur a repris la main (défilement) — l'appui est annulé sans clic.
  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    release();
    onPointerUp?.(e);
  };
  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    release();
    onPointerCancel?.(e);
  };
  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    release();
    onPointerLeave?.(e);
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      data-pressed={(pressed && interactive) || undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      className={`btn-motion ${className}`}
      {...rest}
    >
      {/* display:contents conserve la mise en page flex du bouton ; masqué (sans perdre sa place) pendant le chargement */}
      <span className="contents" style={loading ? { visibility: 'hidden' } : undefined}>
        {children}
      </span>
      {loading && (
        <span role="status" className="absolute inset-0 flex items-center justify-center gap-2">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          />
          {loadingText ? <span>{loadingText}</span> : <span className="sr-only">Chargement…</span>}
        </span>
      )}
    </button>
  );
});
