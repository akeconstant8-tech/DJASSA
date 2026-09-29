import React from 'react';
import { ConfirmedOrder, Language } from '../types';
import { DJASSA_LOGO, translations } from '../data/mockData';
import { m, Reveal, fadeUp, pop, staggerContainer, staggerInterval } from '../motion';

// Articles commandés : apparaissent en cascade juste après le bloc de détail.
const itemsVariants = staggerContainer(staggerInterval.base, 0.5);
import { Button } from './Button';
import { SmartImage } from './SmartImage';

interface OrderConfirmationPageProps {
  order: ConfirmedOrder;
  lang: Language;
  onBackToCatalog: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  lang,
  onBackToCatalog
}) => {
  const t = translations[lang];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#fed7aa]/80 flex flex-col items-center text-center">
        {/* Brand Logo & Success Icon */}
        <div className="flex items-center gap-3 mb-6 bg-gradient-dark text-white px-4 py-2 rounded-2xl border border-zinc-800 shadow-md">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 p-0.5 flex items-center justify-center shrink-0">
            <img
              src={DJASSA_LOGO}
              alt="Djassa Market"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <span className="text-xs font-black tracking-wide">
            Djassa <span className="text-[#ea580c]">Market</span> Reçu Officiel
          </span>
        </div>

        <m.div
          variants={pop}
          custom={0.15}
          initial="hidden"
          animate="visible"
          className="w-20 h-20 rounded-full bg-gradient-orange flex items-center justify-center text-white shadow-lg mb-4"
        >
          <span className="material-symbols-outlined text-[40px]">check</span>
        </m.div>

        <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] text-xs font-black tracking-wide uppercase mb-2">
          Paiement XOF Validé
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
          {t.orderConfirmed}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1 max-w-md">
          {t.orderConfirmedSub}
        </p>

        {/* Tracking Reference Pill */}
        <Reveal
          variant="fadeUp"
          delay={0.25}
          className="mt-6 p-4 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-left"
        >
          <div>
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
              {t.trackingRef}
            </span>
            <span className="text-sm font-black text-[#ea580c] font-mono">
              {order.trackingNumber}
            </span>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
              Livraison Estimée
            </span>
            <span className="text-xs font-bold text-[#0f172a]">
              {order.estimatedDelivery}
            </span>
          </div>
        </Reveal>

        {/* Order Details Card */}
        <Reveal
          variant="fadeUp"
          delay={0.35}
          className="mt-6 w-full text-left bg-[#fffaf5] p-5 rounded-2xl border border-[#fed7aa]/50 flex flex-col gap-4"
        >
          <div className="flex justify-between items-center border-b border-[#fed7aa]/40 pb-2 text-xs">
            <span className="font-bold text-[#0f172a]">Numéro de commande</span>
            <span className="font-mono font-bold text-[#ea580c]">#{order.id}</span>
          </div>

          <m.div variants={itemsVariants} className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#0f172a]">Articles commandés :</span>
            {order.items.map((it) => (
              <m.div key={it.product.id} variants={fadeUp} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <SmartImage
                    src={it.product.image}
                    alt={it.product.name}
                    wrapperClassName="w-10 h-10 rounded-lg bg-white border border-[#fed7aa]/40 shrink-0"
                    className="w-full h-full object-contain p-1"
                  />
                  <div>
                    <span className="font-bold text-[#0f172a] block">
                      {lang === 'FR' ? it.product.name : it.product.nameEn}
                    </span>
                    <span className="text-[11px] text-[#64748b]">Qté : {it.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-[#0f172a]">
                  {(it.product.price * it.quantity).toLocaleString()} XOF
                </span>
              </m.div>
            ))}
          </m.div>

          <div className="border-t border-[#fed7aa]/40 pt-3 flex flex-col gap-1 text-xs text-[#64748b]">
            <div className="flex justify-between">
              <span>Destinataire</span>
              <span className="font-semibold text-[#0f172a]">
                {order.customer.fullName} ({order.customer.phone})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Adresse</span>
              <span className="font-semibold text-[#0f172a]">
                {order.customer.address}, {order.customer.district}, {order.customer.city}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Mode de Paiement</span>
              <span className="font-bold text-[#0f172a] bg-[#fff7ed] px-2 py-0.5 rounded-lg border border-[#fed7aa] text-[11px]">
                {order.customer.paymentMethod === 'orange_money' && 'Orange Money (Validé)'}
                {order.customer.paymentMethod === 'mtn_momo' && 'MTN Money (Validé)'}
                {order.customer.paymentMethod === 'wave' && 'Wave Mobile (Validé)'}
                {order.customer.paymentMethod === 'card' && 'Carte Bancaire (3D Secure)'}
              </span>
            </div>
            <div className="flex justify-between font-black text-sm text-[#0f172a] pt-2 border-t border-[#fed7aa]/40">
              <span>Total Réglé</span>
              <span className="text-[#ea580c]">{order.total.toLocaleString()} XOF</span>
            </div>
          </div>
        </Reveal>

        {/* Action Buttons */}
        <Reveal
          variant="fadeUp"
          delay={0.45}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <Button
            type="button"
            onClick={onBackToCatalog}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-orange text-white text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              shopping_bag
            </span>
            <span>{t.backToCatalog}</span>
          </Button>

          <Button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-[#0f172a] text-xs font-bold border border-[#fed7aa] shadow-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">print</span>
            <span>Imprimer le reçu</span>
          </Button>
        </Reveal>
      </div>
    </div>
  );
};
