import React from 'react';
import { CartItem, Language, PaymentMethod } from '../types';
import { translations } from '../data/mockData';
import { groupCartBySeller } from '../utils/groupCartBySeller';
import { Button } from './Button';
import { SmartImage } from './SmartImage';
import { useOverlay } from '../hooks/useOverlay';
import {
  m,
  backdrop,
  drawerRight,
  enterTransition,
  fadeIn,
  fadeUp,
  stagger,
  staggerContainer,
  staggerInterval,
  type Variants
} from '../motion';

const listVariants = staggerContainer(staggerInterval.base, 0.12);

// Chaque groupe (boutique) apparaît, puis ses articles en cascade.
const groupVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { ...enterTransition, delayChildren: stagger(0.05, { startDelay: 0.06 }) } }
};

// Raccourcis de paiement : cascade en opacité seule (le survol CSS gère la transformation).
const payGridVariants = staggerContainer(staggerInterval.fast, 0.25);

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  // Stock actuel du produit : borne la quantité commandable.
  getStock: (productId: string) => number;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (method?: PaymentMethod) => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  getStock,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  lang
}) => {
  useOverlay(isOpen, onClose);

  if (!isOpen) return null;

  const t = translations[lang];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 50000 || subtotal === 0 ? 0 : 2500;
  const total = subtotal + deliveryFee;
  const sellerGroups = groupCartBySeller(cartItems);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <m.div
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <m.div
          variants={drawerRight}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#fed7aa]/80"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#fed7aa]/50 flex items-center justify-between bg-[#fffaf5]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ea580c] text-[22px]">
                shopping_bag
              </span>
              <h2 className="text-base font-extrabold text-[#0f172a]">
                {t.cart} ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer le panier"
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
            </button>
          </div>

          {/* Cart Items List */}
          <m.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="p-5 flex-1 overflow-y-auto flex flex-col gap-3"
          >
            {cartItems.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-3 text-[#64748b]">
                <div className="w-16 h-16 rounded-full bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">
                    remove_shopping_cart
                  </span>
                </div>
                <p className="text-sm font-bold text-[#0f172a]">Votre panier est vide</p>
                <p className="text-xs max-w-xs">
                  Sélectionnez des articles dans notre catalogue pour passer commande.
                </p>
              </div>
            ) : (
              <>
              {sellerGroups.length > 1 && (
                <p className="text-[11px] text-[#64748b] bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-3 py-2">
                  Votre panier contient des articles de <strong className="text-[#0f172a]">{sellerGroups.length} boutiques</strong> — un seul paiement, un colis par vendeur.
                </p>
              )}
              {sellerGroups.map((group) => (
              <m.section key={group.sellerId} variants={groupVariants} className="flex flex-col gap-2" aria-label={group.shopName}>
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f172a]">
                    <span className="material-symbols-outlined text-[16px] text-[#ea580c]" aria-hidden="true">
                      storefront
                    </span>
                    {group.shopName}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748b]">
                    {group.subtotal.toLocaleString()} XOF
                  </span>
                </div>
              {group.items.map(({ product, quantity }) => {
                const atMax = quantity >= getStock(product.id);
                return (
                // Extérieur : apparition en cascade (motion). Intérieur : élévation au survol (CSS).
                <m.div key={product.id} variants={fadeUp}>
                <div className="card-motion [--card-lift:-2px] p-3.5 rounded-2xl bg-[#fffaf5] border border-[#fed7aa]/60 flex items-center gap-3.5 hover:border-[#ea580c]/40">
                  <SmartImage
                    src={product.image}
                    alt={product.name}
                    wrapperClassName="w-14 h-14 rounded-xl bg-white border border-[#fed7aa]/40 shrink-0"
                    className="w-full h-full object-contain p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#0f172a] truncate">
                      {lang === 'FR' ? product.name : product.nameEn}
                    </h4>
                    <p className="text-xs font-extrabold text-[#ea580c] mt-0.5">
                      {product.price.toLocaleString()} XOF
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        aria-label="Diminuer la quantité"
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0f172a] font-bold text-sm border border-[#fed7aa] btn-motion"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-5 text-center" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        disabled={atMax}
                        aria-label="Augmenter la quantité"
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0f172a] font-bold text-sm border border-[#fed7aa] btn-motion"
                      >
                        +
                      </button>
                      {atMax && (
                        <span className="text-[10px] font-bold text-[#c2410c] animate-fade-in">Stock max</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(product.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#dc2626] btn-motion"
                    title="Supprimer"
                    aria-label="Supprimer l'article"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      delete
                    </span>
                  </button>
                </div>
                </m.div>
                );
              })}
              </m.section>
              ))}
              </>
            )}
          </m.div>

          {/* Footer Checkout Bar */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#fed7aa]/60 bg-[#fffaf5] flex flex-col gap-3">
              <div className="flex justify-between text-xs text-[#64748b]">
                <span>{t.subtotal}</span>
                <span className="font-bold text-[#0f172a]">
                  {subtotal.toLocaleString()} XOF
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#64748b]">
                <span>{t.deliveryFee}</span>
                <span className="font-bold text-[#0f172a]">
                  {deliveryFee === 0 ? (
                    <span className="text-[#16a34a] font-extrabold">Gratuit</span>
                  ) : (
                    `${deliveryFee.toLocaleString()} XOF`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#0f172a] pt-2 border-t border-[#fed7aa]/60">
                <span>{t.totalToPay}</span>
                <span className="text-base text-[#ea580c] font-black">
                  {total.toLocaleString()} XOF
                </span>
              </div>

              {/* Explicit payment method choices right in the cart */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#ea580c]">
                    touch_app
                  </span>
                  Choisissez le mode de paiement désiré :
                </span>
                <m.div variants={payGridVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2">
                  <m.button
                    type="button"
                    variants={fadeIn}
                    onClick={() => {
                      onProceedToCheckout('orange_money');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#ff6600]/40 text-left card-interactive [--card-lift:-2px] flex items-center gap-2 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#ff6600] text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs">
                      OM
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-[#0f172a] block truncate">
                        Orange Money
                      </span>
                      <span className="text-[9px] text-[#c2410c] font-semibold">Payer</span>
                    </div>
                  </m.button>

                  <m.button
                    type="button"
                    variants={fadeIn}
                    onClick={() => {
                      onProceedToCheckout('mtn_momo');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#fefce8] hover:bg-[#fef08a]/60 border border-[#ca8a04]/40 text-left card-interactive [--card-lift:-2px] flex items-center gap-2 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#facc15] text-[#0f172a] border border-[#eab308] flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs">
                      MTN
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-[#0f172a] block truncate">
                        MTN Money
                      </span>
                      <span className="text-[9px] text-[#854d0e] font-semibold">Payer</span>
                    </div>
                  </m.button>

                  <m.button
                    type="button"
                    variants={fadeIn}
                    onClick={() => {
                      onProceedToCheckout('wave');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#0284c7]/40 text-left card-interactive [--card-lift:-2px] flex items-center gap-2 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0284c7] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      🌊
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-[#0f172a] block truncate">
                        Wave Mobile
                      </span>
                      <span className="text-[9px] text-[#0369a1] font-semibold">Payer</span>
                    </div>
                  </m.button>

                  <m.button
                    type="button"
                    variants={fadeIn}
                    onClick={() => {
                      onProceedToCheckout('card');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#0f172a]/30 text-left card-interactive [--card-lift:-2px] flex items-center gap-2 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-dark text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">credit_card</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-[#0f172a] block truncate">
                        Carte Bancaire
                      </span>
                      <span className="text-[9px] text-[#475569] font-semibold">Visa/Mastercard</span>
                    </div>
                  </m.button>
                </m.div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  onProceedToCheckout();
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-orange text-white text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                <span>Accéder au choix du paiement</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Button>
            </div>
          )}
        </m.div>
      </div>
    </div>
  );
};
