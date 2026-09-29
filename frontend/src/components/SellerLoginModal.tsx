import React, { useState } from 'react';
import { DJASSA_LOGO, SELLER_ACCOUNTS } from '../data/mockData';
import { SellerProfile } from '../types';
import { m, backdrop, fadeIn, modal, staggerContainer, staggerInterval } from '../motion';

// Comptes de démonstration : cascade en opacité à l'ouverture (l'élévation au survol est en CSS).
const demoListVariants = staggerContainer(staggerInterval.base, 0.12);
import { Button } from './Button';
import { useOverlay } from '../hooks/useOverlay';

interface SellerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: SellerProfile) => void;
}

export const SellerLoginModal: React.FC<SellerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useOverlay(isOpen, onClose);

  if (!isOpen) return null;

  const demoAccounts = Object.values(SELLER_ACCOUNTS);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const profile = SELLER_ACCOUNTS[email.trim().toLowerCase()];
    if (!profile) {
      setError('Aucun compte vendeur ne correspond à cet email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPassword('');
      onLoginSuccess(profile);
      onClose();
    }, 600);
  };

  return (
    <m.div
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <m.div variants={modal} className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-800 overflow-hidden flex flex-col">
        {/* Header with black gradient (dégradé noir) & official logo */}
        <div className="p-6 bg-gradient-dark text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 p-1 border border-zinc-700 shadow-md shrink-0 flex items-center justify-center">
              <img
                src={DJASSA_LOGO}
                alt="Djassa Market"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Espace Vendeur Djassa Market
              </h3>
              <p className="text-[11px] text-zinc-400">
                Authentification pour la gestion des stocks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="seller-email" className="text-xs font-bold text-[#0f172a]">
              Email Vendeur
            </label>
            <input
              id="seller-email"
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="vous@boutique.ci"
              className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] border border-[#fed7aa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="seller-password" className="text-xs font-bold text-[#0f172a]">
              Mot de passe
            </label>
            <input
              id="seller-password"
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] border border-[#fed7aa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 font-medium"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-semibold text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          {/* Comptes de démonstration (mock — remplacés par l'API /auth/login) */}
          <m.div variants={demoListVariants} className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Comptes de démonstration
            </span>
            {demoAccounts.map((acc) => (
              <m.button
                key={acc.id}
                type="button"
                variants={fadeIn}
                onClick={() => {
                  setEmail(acc.email);
                  setError(null);
                }}
                aria-pressed={email === acc.email}
                className={`p-3 rounded-2xl border flex items-center justify-between text-left card-interactive [--card-lift:-2px] ${
                  email === acc.email
                    ? 'bg-[#fff7ed] border-[#ea580c] ring-2 ring-[#ea580c]/20'
                    : 'bg-white border-[#fed7aa] hover:bg-[#fffaf5]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-dark text-[#ea580c] flex items-center justify-center font-black text-[10px] border border-zinc-800 shadow-xs shrink-0">
                    PRO
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-extrabold text-[#0f172a] block truncate">{acc.shopName}</span>
                    <span className="text-[10px] text-[#64748b] block truncate">{acc.email}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#16a34a] text-[18px]" aria-hidden="true">
                  verified
                </span>
              </m.button>
            ))}
          </m.div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              loading={loading}
              loadingText="Connexion en cours…"
              className="w-full py-3 rounded-2xl bg-gradient-orange text-white text-xs font-extrabold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">login</span>
              <span>Accéder à la gestion des stocks</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl text-xs font-semibold text-[#64748b] btn-motion"
            >
              Continuer comme client
            </button>
          </div>
        </form>
      </m.div>
    </m.div>
  );
};
