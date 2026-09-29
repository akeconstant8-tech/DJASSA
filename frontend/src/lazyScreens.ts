import { lazy } from 'react';

// Écrans chargés à la demande : hors du bundle initial, donc un premier affichage plus rapide pour l'acheteur.
// Les mêmes fonctions servent au préchargement : un module déjà importé est servi depuis le cache.
const loaders = {
  checkout: () => import('./components/CheckoutPage'),
  confirmation: () => import('./components/OrderConfirmationPage'),
  sellerLogin: () => import('./components/SellerLoginModal'),
  sellerAdmin: () => import('./components/SellerAdminStock'),
  newProduct: () => import('./components/NewProductModal')
};

type ScreenKey = keyof typeof loaders;

export const CheckoutPage = lazy(() => loaders.checkout().then((m) => ({ default: m.CheckoutPage })));
export const OrderConfirmationPage = lazy(() =>
  loaders.confirmation().then((m) => ({ default: m.OrderConfirmationPage }))
);
export const SellerLoginModal = lazy(() => loaders.sellerLogin().then((m) => ({ default: m.SellerLoginModal })));
export const SellerAdminStock = lazy(() => loaders.sellerAdmin().then((m) => ({ default: m.SellerAdminStock })));
export const NewProductModal = lazy(() => loaders.newProduct().then((m) => ({ default: m.NewProductModal })));

// Échec réseau ignoré : le chargement sera retenté à l'affichage réel de l'écran.
export function prefetchScreens(...keys: ScreenKey[]) {
  keys.forEach((key) => {
    loaders[key]().catch(() => {});
  });
}

// Après le premier affichage, quand le navigateur est inactif : écrans probables du parcours acheteur.
// Les écrans vendeur ne sont préchargés qu'à l'ouverture de la connexion (intention).
export function prefetchBuyerScreensWhenIdle() {
  const run = () => prefetchScreens('checkout', 'confirmation', 'sellerLogin');
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 5000 });
  else setTimeout(run, 3000);
}
