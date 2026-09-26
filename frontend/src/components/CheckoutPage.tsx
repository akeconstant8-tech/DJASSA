import React, { useState } from 'react';
import { CartItem, CustomerOrderInfo, ConfirmedOrder, Language } from '../types';
import { DJASSA_LOGO, translations } from '../data/mockData';

interface CheckoutPageProps {
  cartItems: CartItem[];
  lang: Language;
  onBackToCatalog: () => void;
  onOrderConfirmed: (order: ConfirmedOrder) => void;
  initialPaymentMethod?: 'orange_money' | 'mtn_momo' | 'wave' | 'card' | null;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  lang,
  onBackToCatalog,
  onOrderConfirmed,
  initialPaymentMethod = null
}) => {
  const t = translations[lang];

  // Delivery details
  const [fullName, setFullName] = useState('Aminata Diallo');
  const [phone, setPhone] = useState('+225 07 48 92 11 00');
  const [city, setCity] = useState('Abidjan');
  const [district, setDistrict] = useState('Cocody Deux-Plateaux');
  const [address, setAddress] = useState('Villa 42, Rue des Jardins');
  const [notes, setNotes] = useState('Face à la pharmacie, portail blanc');

  // Explicit Payment Selection by client
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'mtn_momo' | 'wave' | 'card' | null>(
    initialPaymentMethod
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Payment specific details
  const [omNumber, setOmNumber] = useState('+225 07 48 92 11 00');
  const [mtnNumber, setMtnNumber] = useState('+225 05 77 12 34 56');
  const [waveNumber, setWaveNumber] = useState('+225 01 23 45 67 89');
  const [cardNumber, setCardNumber] = useState('4242 8890 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('482');
  const [cardHolder, setCardHolder] = useState('Aminata Diallo');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const subtotal = cartItems.reduce(
    (acc, it) => acc + it.product.price * it.quantity,
    0
  );
  const deliveryFee = subtotal >= 50000 || subtotal === 0 ? 0 : 2500;
  const total = subtotal + deliveryFee;

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case 'orange_money':
        return 'Orange Money';
      case 'mtn_momo':
        return 'MTN Money';
      case 'wave':
        return 'Wave Mobile';
      case 'card':
        return 'Carte Bancaire (Visa/Mastercard)';
      default:
        return 'Non sélectionné';
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      setPaymentError("Veuillez choisir le mode de paiement que vous désirez ci-dessous pour continuer.");
      return;
    }
    if (!fullName || !address) return;

    setPaymentError(null);
    setIsProcessing(true);

    if (paymentMethod === 'orange_money') {
      setProcessingStep("Connexion à la passerelle Orange Money... Envoi de l'invitation USSD au " + omNumber);
    } else if (paymentMethod === 'mtn_momo') {
      setProcessingStep("Notification Push MTN MoMo transmise au " + mtnNumber + "... En attente d'approbation");
    } else if (paymentMethod === 'wave') {
      setProcessingStep("Ouverture de la transaction sécurisée Wave pour le " + waveNumber + "...");
    } else {
      setProcessingStep("Validation 3D Secure auprès du serveur bancaire certifié...");
    }

    setTimeout(() => {
      const orderInfo: CustomerOrderInfo = {
        fullName,
        phone: paymentMethod === 'orange_money' ? omNumber : paymentMethod === 'mtn_momo' ? mtnNumber : paymentMethod === 'wave' ? waveNumber : phone,
        city,
        district,
        address,
        notes,
        paymentMethod
      };

      const confirmed: ConfirmedOrder = {
        id: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        customer: orderInfo,
        items: [...cartItems],
        subtotal,
        deliveryFee,
        total,
        paymentStatus: 'paid',
        trackingNumber: `DJ-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDelivery: 'Demain avant 17h00'
      };

      setIsProcessing(false);
      onOrderConfirmed(confirmed);
    }, 1800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Return button & Brand badge */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-[#ea580c] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{t.backToCatalog}</span>
        </button>

        <div className="flex items-center gap-2 bg-gradient-dark text-white px-3.5 py-1.5 rounded-full border border-zinc-800 shadow-sm text-xs font-bold">
          <div className="w-5 h-5 rounded-md bg-zinc-900 overflow-hidden flex items-center justify-center p-0.5 border border-zinc-700 shrink-0">
            <img src={DJASSA_LOGO} alt="Djassa Market" className="w-full h-full object-contain" />
          </div>
          <span>Djassa <strong className="text-[#ea580c]">Market</strong> • Passerelle de Paiement Sécurisée</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] animate-pulse" />
          <span className="text-xs font-black tracking-wider uppercase text-[#ea580c]">
            Validation du Panier & Paiement Immédiat
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Paiement Sécurisé : Orange Money, MTN Money, Wave & Carte
        </h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1 max-w-2xl">
          Sélectionnez votre moyen de paiement préféré pour valider votre commande en toute sécurité (Devise officielle : XOF).
        </p>
      </div>

      <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 1. Payment Methods (Prominent First) & 2. Delivery Address (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* SECTION 1 : MODE DE PAIEMENT SÉCURISÉ */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#fed7aa] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#fed7aa]/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-orange text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-[#0f172a]">
                    1. Choisissez votre moyen de paiement
                  </h2>
                  <p className="text-[11px] text-[#64748b]">
                    Transactions instantanées sans surcoût caché
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-[#16a34a] bg-[#dcfce7] px-2.5 py-1 rounded-full uppercase tracking-wider">
                100% Chiffré XOF
              </span>
            </div>

            {/* 4 Branded Payment Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Orange Money */}
              <div
                onClick={() => setPaymentMethod('orange_money')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'orange_money'
                    ? 'border-[#ff6600] bg-[#fff7ed] shadow-sm ring-2 ring-[#ff6600]/20'
                    : 'border-[#fed7aa]/70 bg-[#fffaf5] hover:bg-white hover:border-[#ff6600]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#ff6600] text-white flex flex-col items-center justify-center font-black shadow-xs">
                      <span className="text-xs leading-none">OM</span>
                      <span className="text-[8px] font-bold uppercase tracking-tighter">Money</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0f172a] block">
                        Orange Money
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        Côte d'Ivoire & UEMOA
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentMethod === 'orange_money'}
                    onChange={() => setPaymentMethod('orange_money')}
                    className="accent-[#ff6600] w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="text-[10px] text-[#c2410c] font-semibold bg-[#ffedd5] px-2.5 py-1 rounded-xl">
                  Validation USSD #144*82# ou App
                </div>
              </div>

              {/* Option 2: MTN Money */}
              <div
                onClick={() => setPaymentMethod('mtn_momo')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'mtn_momo'
                    ? 'border-[#ca8a04] bg-[#fefce8] shadow-sm ring-2 ring-[#ca8a04]/20'
                    : 'border-[#fed7aa]/70 bg-[#fffaf5] hover:bg-white hover:border-[#ca8a04]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#facc15] text-[#0f172a] flex flex-col items-center justify-center font-black shadow-xs border border-[#eab308]">
                      <span className="text-xs leading-none">MTN</span>
                      <span className="text-[8px] font-bold uppercase tracking-tighter">MoMo</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0f172a] block">
                        MTN Money
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        MoMo instantané
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentMethod === 'mtn_momo'}
                    onChange={() => setPaymentMethod('mtn_momo')}
                    className="accent-[#ca8a04] w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="text-[10px] text-[#854d0e] font-semibold bg-[#fef08a] px-2.5 py-1 rounded-xl">
                  Notification Push automatique
                </div>
              </div>

              {/* Option 3: Wave */}
              <div
                onClick={() => setPaymentMethod('wave')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'wave'
                    ? 'border-[#0284c7] bg-[#f0f9ff] shadow-sm ring-2 ring-[#0284c7]/20'
                    : 'border-[#fed7aa]/70 bg-[#fffaf5] hover:bg-white hover:border-[#0284c7]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#0284c7] text-white flex flex-col items-center justify-center font-black shadow-xs">
                      <span className="text-base leading-none">🌊</span>
                      <span className="text-[8px] font-extrabold uppercase tracking-tighter">Wave</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0f172a] block">
                        Wave Mobile
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        1% sans frais cachés
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentMethod === 'wave'}
                    onChange={() => setPaymentMethod('wave')}
                    className="accent-[#0284c7] w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="text-[10px] text-[#0369a1] font-semibold bg-[#e0f2fe] px-2.5 py-1 rounded-xl">
                  1-Clic QR Code ou App Wave
                </div>
              </div>

              {/* Option 4: Carte Bancaire */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'card'
                    ? 'border-[#0f172a] bg-[#f8fafc] shadow-sm ring-2 ring-[#0f172a]/20'
                    : 'border-[#fed7aa]/70 bg-[#fffaf5] hover:bg-white hover:border-[#0f172a]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-dark text-white flex items-center justify-center font-black shadow-xs border border-zinc-700">
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0f172a] block">
                        Carte Bancaire
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        Visa & Mastercard
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-[#0f172a] w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="text-[10px] text-[#334155] font-semibold bg-[#e2e8f0] px-2.5 py-1 rounded-xl">
                  Protégé par 3D Secure
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Input Panel for Selected Provider */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] flex flex-col gap-3.5 animate-in fade-in duration-200">
              {paymentMethod === 'orange_money' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#c2410c]">
                    <span className="w-2 h-2 rounded-full bg-[#ff6600]" />
                    <span>Configuration Orange Money CI & UEMOA</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0f172a]">
                      Numéro de téléphone Orange Money *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="tel"
                        value={omNumber}
                        onChange={(e) => setOmNumber(e.target.value)}
                        placeholder="+225 07 XX XX XX XX"
                        className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-[#fed7aa] font-mono text-xs font-black text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#ff6600]">
                        Orange
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748b] bg-white p-3 rounded-xl border border-[#fed7aa]/50 leading-relaxed">
                    💡 <strong>Instructions :</strong> Lors du clic sur Confirmer, composez le <code className="bg-[#fff7ed] px-1 py-0.5 rounded text-[#ea580c] font-bold">#144*82#</code> pour générer votre code d'autorisation temporaire, ou approuvez directement l'alerte sur l'app Orange Money.
                  </p>
                </div>
              )}

              {paymentMethod === 'mtn_momo' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#854d0e]">
                    <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                    <span>Configuration MTN Mobile Money</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0f172a]">
                      Numéro de téléphone MTN MoMo *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="tel"
                        value={mtnNumber}
                        onChange={(e) => setMtnNumber(e.target.value)}
                        placeholder="+225 05 XX XX XX XX"
                        className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-[#fed7aa] font-mono text-xs font-black text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#ca8a04]/30"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#ca8a04]">
                        MTN
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748b] bg-white p-3 rounded-xl border border-[#fed7aa]/50 leading-relaxed">
                    💡 <strong>Instructions :</strong> Un prompt Push sera envoyé immédiatement sur votre smartphone. Entrez votre code PIN secret ou composez <code className="bg-[#fefce8] px-1 py-0.5 rounded text-[#854d0e] font-bold">*133#</code> pour autoriser le prélèvement.
                  </p>
                </div>
              )}

              {paymentMethod === 'wave' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#0369a1]">
                    <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                    <span>Configuration Wave Mobile Money</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0f172a]">
                      Numéro de compte Wave *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="tel"
                        value={waveNumber}
                        onChange={(e) => setWaveNumber(e.target.value)}
                        placeholder="+225 01 XX XX XX XX"
                        className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-[#fed7aa] font-mono text-xs font-black text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0284c7]">
                        Wave
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748b] bg-white p-3 rounded-xl border border-[#fed7aa]/50 leading-relaxed">
                    💡 <strong>Paiement Wave :</strong> Validation directe via notification dans votre application Wave avec confirmation instantanée par QR code.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f172a]">
                    <span className="w-2 h-2 rounded-full bg-[#0f172a]" />
                    <span>Carte Bancaire Visa / Mastercard</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0f172a]">
                      Numéro de Carte *
                    </label>
                    <input
                      required
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full p-3 rounded-2xl bg-white border border-[#fed7aa] font-mono text-xs font-black text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0f172a]">
                        Expiration (MM/AA) *
                      </label>
                      <input
                        required
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="p-3 rounded-2xl bg-white border border-[#fed7aa] font-mono text-xs font-semibold text-[#0f172a] focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0f172a]">
                        CVC / CVV *
                      </label>
                      <input
                        required
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="p-3 rounded-2xl bg-white border border-[#fed7aa] font-mono text-xs font-semibold text-[#0f172a] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0f172a]">
                      Titulaire de la carte
                    </label>
                    <input
                      required
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Nom tel qu'indiqué sur la carte"
                      className="p-3 rounded-2xl bg-white border border-[#fed7aa] text-xs font-medium text-[#0f172a] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2 : COORDONNÉES DE LIVRAISON */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#fed7aa]/60 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#fed7aa]/50 pb-3">
              <span className="material-symbols-outlined text-[#ea580c] text-[22px]">
                local_shipping
              </span>
              <h2 className="text-base font-bold text-[#0f172a]">
                2. {t.deliveryInfo}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a]">
                  {t.fullName} *
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] font-medium border border-[#fed7aa]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a]">
                  {t.phone} *
                </label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-3 rounded-2xl bg-[#fffaf5] text-xs font-mono text-[#0f172a] font-semibold border border-[#fed7aa]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a]">{t.city}</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] font-semibold border border-[#fed7aa]/70 focus:outline-none cursor-pointer"
                >
                  <option value="Abidjan">Abidjan (Côte d'Ivoire)</option>
                  <option value="Yamoussoukro">Yamoussoukro (Côte d'Ivoire)</option>
                  <option value="Bouaké">Bouaké (Côte d'Ivoire)</option>
                  <option value="Dakar">Dakar (Sénégal)</option>
                  <option value="Lomé">Lomé (Togo)</option>
                  <option value="Cotonou">Cotonou (Bénin)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a]">{t.district}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="ex. Cocody, Deux-Plateaux, Marcory..."
                  className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] border border-[#fed7aa]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a]">{t.address} *</label>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Numéro de rue, nom d'immeuble, résidence..."
                className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] border border-[#fed7aa]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a]">{t.notes}</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Précisions de repère pour le coursier..."
                className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] border border-[#fed7aa]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Instant Checkout CTA (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#fed7aa] flex flex-col gap-4">
            <h3 className="text-base font-black text-[#0f172a] border-b border-[#fed7aa]/60 pb-3">
              {t.orderSummary} ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>

            {/* Items review */}
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-contain rounded-xl bg-[#fffaf5] p-1 border border-[#fed7aa]/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0f172a] truncate">
                      {lang === 'FR' ? product.name : product.nameEn}
                    </p>
                    <p className="text-[11px] text-[#64748b]">Qté : {quantity}</p>
                  </div>
                  <span className="font-black text-[#0f172a]">
                    {(product.price * quantity).toLocaleString()} XOF
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#fed7aa]/60 text-xs text-[#64748b]">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-bold text-[#0f172a]">
                  {subtotal.toLocaleString()} XOF
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.deliveryFee}</span>
                <span className="font-bold text-[#0f172a]">
                  {deliveryFee === 0 ? (
                    <span className="text-[#16a34a] font-extrabold">Offert</span>
                  ) : (
                    `${deliveryFee.toLocaleString()} XOF`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-[#0f172a] pt-3 border-t border-[#fed7aa]/60">
                <span>{t.totalToPay}</span>
                <span className="text-lg text-[#ea580c]">
                  {total.toLocaleString()} XOF
                </span>
              </div>
            </div>

            {/* Selected Method Pill */}
            <div className="p-3 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] flex items-center justify-between text-xs">
              <span className="text-[#64748b] font-medium">Règlement sélectionné :</span>
              <span className="font-black text-[#0f172a]">{getPaymentMethodLabel()}</span>
            </div>

            {/* Payment CTA Button */}
            <button
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-orange hover:bg-gradient-to-r hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs font-black shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <span className="material-symbols-outlined text-[20px]">
                  lock
                </span>
                <span>Payer {total.toLocaleString()} XOF</span>
              </div>
              <span className="text-[10px] text-white/90 font-medium">
                via {getPaymentMethodLabel()}
              </span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#64748b]">
              <span className="material-symbols-outlined text-[16px] text-[#16a34a]">
                verified_user
              </span>
              <span>Paiement chiffré SSL 256-bit garanti par Djassa Market</span>
            </div>
          </div>
        </div>
      </form>

      {/* Realistic Provider Payment Processing Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-800 flex flex-col items-center text-center gap-4">
            {paymentMethod === 'orange_money' && (
              <div className="w-16 h-16 rounded-2xl bg-[#ff6600] text-white flex flex-col items-center justify-center font-black shadow-lg animate-bounce">
                <span className="text-base leading-none">OM</span>
                <span className="text-[9px] uppercase font-bold">Orange</span>
              </div>
            )}
            {paymentMethod === 'mtn_momo' && (
              <div className="w-16 h-16 rounded-2xl bg-[#facc15] text-[#0f172a] flex flex-col items-center justify-center font-black shadow-lg animate-bounce border border-[#eab308]">
                <span className="text-base leading-none">MTN</span>
                <span className="text-[9px] uppercase font-bold">MoMo</span>
              </div>
            )}
            {paymentMethod === 'wave' && (
              <div className="w-16 h-16 rounded-2xl bg-[#0284c7] text-white flex flex-col items-center justify-center font-black shadow-lg animate-bounce">
                <span className="text-2xl leading-none">🌊</span>
                <span className="text-[9px] uppercase font-bold">Wave</span>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="w-16 h-16 rounded-2xl bg-gradient-dark text-white flex items-center justify-center font-black shadow-lg animate-bounce border border-zinc-700">
                <span className="material-symbols-outlined text-[32px] text-[#ea580c]">credit_card</span>
              </div>
            )}

            <div>
              <h3 className="text-base font-black text-[#0f172a]">
                Traitement du Paiement en Cours
              </h3>
              <p className="text-xs text-[#ea580c] font-bold mt-1">
                {getPaymentMethodLabel()}
              </p>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed max-w-xs bg-[#fffaf5] p-3 rounded-2xl border border-[#fed7aa]">
              {processingStep}
            </p>

            <div className="w-8 h-8 rounded-full border-3 border-[#ea580c] border-t-transparent animate-spin" />
            <span className="text-[11px] text-[#94a3b8]">Ne fermez pas cette page...</span>
          </div>
        </div>
      )}
    </div>
  );
};
