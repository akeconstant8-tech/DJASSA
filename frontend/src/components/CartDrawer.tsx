import React from 'react';
import { CartItem, Language } from '../types';
import { translations } from '../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (method?: 'orange_money' | 'mtn_momo' | 'wave' | 'card') => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  lang
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 50000 || subtotal === 0 ? 0 : 2500;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#fed7aa]/80">
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
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-3">
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
              cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-2xl bg-[#fffaf5] border border-[#fed7aa]/60 flex items-center gap-3.5 hover:border-[#ea580c]/40 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-[#fed7aa]/40 shrink-0"
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
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="w-6 h-6 rounded-md bg-white hover:bg-[#ffedd5] flex items-center justify-center text-[#0f172a] font-bold text-xs border border-[#fed7aa]"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="w-6 h-6 rounded-md bg-white hover:bg-[#ffedd5] flex items-center justify-center text-[#0f172a] font-bold text-xs border border-[#fed7aa]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-[#94a3b8] hover:text-[#dc2626] p-1.5 transition-colors"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>

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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onProceedToCheckout('orange_money');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#ff6600]/40 text-left transition-all flex items-center gap-2 group cursor-pointer"
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
                  </button>

                  <button
                    onClick={() => {
                      onProceedToCheckout('mtn_momo');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#fefce8] hover:bg-[#fef08a]/60 border border-[#ca8a04]/40 text-left transition-all flex items-center gap-2 group cursor-pointer"
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
                  </button>

                  <button
                    onClick={() => {
                      onProceedToCheckout('wave');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#0284c7]/40 text-left transition-all flex items-center gap-2 group cursor-pointer"
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
                  </button>

                  <button
                    onClick={() => {
                      onProceedToCheckout('card');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#0f172a]/30 text-left transition-all flex items-center gap-2 group cursor-pointer"
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
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  onProceedToCheckout();
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-orange hover:bg-gradient-to-r hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mt-1 cursor-pointer"
              >
                <span>Accéder au choix du paiement</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
