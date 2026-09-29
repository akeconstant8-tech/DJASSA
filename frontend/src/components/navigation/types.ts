export interface NavItem {
  key: string;
  label: string;
  icon: string;
  onSelect: () => void;
  ariaLabel?: string;
  // Précision affichée sous le libellé dans le menu mobile (ex. « Connexion requise »).
  hint?: string;
  badge?: number;
}
