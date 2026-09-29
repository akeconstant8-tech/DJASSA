import React, { useCallback, useState } from 'react';

type SmartImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> & {
  // Dimensionne le conteneur (le squelette occupe exactement la place de l'image : pas de saut de mise en page).
  wrapperClassName?: string;
  // Squelette sombre pour les fonds noirs (hero, bandeaux).
  dark?: boolean;
  // Image au-dessus de la ligne de flottaison : chargement prioritaire au lieu de différé.
  priority?: boolean;
};

// Image avec squelette pendant le chargement, apparition en fondu, et repli si l'image est inaccessible.
export function SmartImage({
  wrapperClassName = '',
  className = '',
  dark = false,
  priority = false,
  alt = '',
  ...imgProps
}: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Image déjà en cache (complete avant l'hydratation) : pas d'événement load, on la marque tout de suite.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, []);

  return (
    <span className={`relative block overflow-hidden ${wrapperClassName}`}>
      {status !== 'loaded' && (
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-[inherit] ${status === 'loading' ? `skeleton ${dark ? 'skeleton-dark' : ''}` : ''}`}
        >
          {status === 'error' && (
            <span className="absolute inset-0 flex items-center justify-center text-[#cbd5e1]">
              <span className="material-symbols-outlined text-[28px]">image_not_supported</span>
            </span>
          )}
        </span>
      )}
      {status !== 'error' && (
        <img
          ref={imgRef}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          data-loaded={status === 'loaded' || undefined}
          className={`img-fade ${className}`}
          {...imgProps}
        />
      )}
    </span>
  );
}
