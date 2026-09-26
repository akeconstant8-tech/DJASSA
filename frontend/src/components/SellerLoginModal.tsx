import React, { useState } from 'react';
import { DJASSA_LOGO } from '../data/mockData';
import { SellerProfile } from '../types';

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
  const [email, setEmail] = useState('amara.toure@djassa.ci');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        isAuthenticated: true,
        email: email || 'amara.toure@djassa.ci',
        name: 'Amara Touré',
        shopName: 'TechHub Abidjan',
        role: 'Vendeur Certifié Djassa Market'
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-800 overflow-hidden flex flex-col">
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
            className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a]">
              Email Vendeur
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] border border-[#fed7aa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a]">
              Mot de passe
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-2xl bg-[#fffaf5] text-xs text-[#0f172a] border border-[#fed7aa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 font-medium"
            />
          </div>

          {/* Clean seller badge without personal photo */}
          <div className="p-3.5 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-dark text-[#ea580c] flex items-center justify-center font-black text-xs border border-zinc-800 shadow-xs">
                PRO
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-[#0f172a] block">
                  TechHub Abidjan
                </span>
                <span className="text-[10px] text-[#ea580c] font-semibold">
                  Compte Vendeur Vérifié • Djassa Market
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#16a34a] text-[18px]">
              verified
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-orange hover:bg-gradient-to-r hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs font-extrabold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    refresh
                  </span>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Accéder à la gestion des stocks</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl text-xs font-semibold text-[#64748b] hover:bg-[#fffaf5] transition-colors"
            >
              Continuer comme client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
