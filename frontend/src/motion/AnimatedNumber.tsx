import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { ease } from './tokens';

type AnimatedNumberProps = {
  value: number;
  format?: (n: number) => string;
  className?: string;
};

const defaultFormat = (n: number) => Math.round(n).toLocaleString();

// Nombre qui compte jusqu'à sa valeur à l'apparition, puis se transforme à chaque changement
// (retour visuel quand le stock est ajusté). Chiffres à chasse fixe : pas de tremblement de largeur.
// Le texte est écrit directement dans le DOM : aucun rendu React pendant l'animation.
export function AnimatedNumber({ value, format = defaultFormat, className = '' }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  // Dernière valeur affichée : point de départ de l'animation suivante (0 au premier affichage).
  const displayed = useRef(reduceMotion ? value : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      displayed.current = value;
      el.textContent = format(value);
      return;
    }
    const controls = animate(displayed.current, value, {
      duration: 0.8,
      ease: ease.emphasized,
      onUpdate: (v) => {
        displayed.current = v;
        el.textContent = format(v);
      }
    });
    return () => controls.stop();
  }, [value, reduceMotion, format]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {format(displayed.current)}
    </span>
  );
}
