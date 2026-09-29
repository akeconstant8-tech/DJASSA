import type { ReactNode } from 'react';

// Bloc de remplacement (voir l'utilitaire CSS `skeleton`). Purement décoratif : masqué aux lecteurs d'écran.
export function Skeleton({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return <div aria-hidden="true" className={`relative skeleton ${dark ? 'skeleton-dark' : ''} rounded-xl ${className}`} />;
}

// Conteneur d'un squelette de page : annonce le chargement une seule fois aux technologies d'assistance.
export function SkeletonRegion({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
