import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product, Language, SellerProfile } from '../types';
import { DJASSA_LOGO, translations } from '../data/mockData';
import {
  AnimatePresence,
  m,
  Reveal,
  Stagger,
  StaggerItem,
  fadeIn,
  staggerContainer,
  staggerInterval,
  toast
} from '../motion';

import { Button } from './Button';
import { SmartImage } from './SmartImage';

const rowsVariants = staggerContainer(staggerInterval.fast, 0.2);

interface SellerAdminStockProps {
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onToggleProductVisibility: (productId: string) => void;
  onOpenNewProduct: () => void;
  onBackToMarketplace: () => void;
  seller: SellerProfile;
  lang: Language;
}

export const SellerAdminStock: React.FC<SellerAdminStockProps> = ({
  products,
  onUpdateProductStock,
  onToggleProductVisibility,
  onOpenNewProduct,
  onBackToMarketplace,
  seller,
  lang
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low_stock' | 'out_of_stock' | 'online' | 'hidden'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  // Inventory stats
  const totalStockUnits = useMemo(
    () => products.reduce((acc, p) => acc + p.stock, 0),
    [products]
  );
  const totalStockValueXOF = useMemo(
    () => products.reduce((acc, p) => acc + p.stock * p.price, 0),
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock < 10).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stock <= 0).length,
    [products]
  );

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filterMode === 'low_stock' && (p.stock <= 0 || p.stock >= 10)) return false;
      if (filterMode === 'out_of_stock' && p.stock > 0) return false;
      if (filterMode === 'online' && !p.visibility) return false;
      if (filterMode === 'hidden' && p.visibility) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchName = (p.name + ' ' + p.nameEn).toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      return true;
    });
  }, [products, filterMode, search]);

  // Un seul minuteur actif : un nouveau message n'est plus effacé par le minuteur du précédent.
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showToast = (message: string, duration: number) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), duration);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleStockDelta = (productId: string, current: number, delta: number) => {
    const nextVal = Math.max(0, current + delta);
    onUpdateProductStock(productId, nextVal);
    showToast(`Stock actualisé : ${nextVal} unités.`, 2500);
  };

  const handleReplenish = (product: Product) => {
    const nextVal = product.stock + 25;
    onUpdateProductStock(product.id, nextVal);
    showToast(`+25 unités ajoutées au stock de ${product.name}.`, 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <m.div
            key={toastMessage}
            variants={toast}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="status"
            className="fixed bottom-6 right-6 max-w-[calc(100vw-3rem)] bg-[#0f172a] text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3 border border-[#ea580c]"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-orange text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Header with black gradient (dégradé noir) & official logo */}
      <Reveal
        variant="fadeUp"
        className="bg-gradient-dark text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          {/* Official Djassa Market 3D Logo */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900/90 p-1 border-2 border-[#ea580c]/50 shadow-md shrink-0 flex items-center justify-center">
            <img
              src={DJASSA_LOGO}
              alt="Djassa Market Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-zinc-900 text-[#f97316] text-xs font-black flex items-center gap-1.5 border border-zinc-700">
                <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
                <span>{seller.shopName}</span>
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-semibold">Djassa Market Pro</span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-[#16a34a] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                Vendeur Certifié
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t.sellerStockTitle}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl">
              {t.sellerStockSubtitle}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Button
            type="button"
            onClick={onBackToMarketplace}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white text-xs font-bold border border-zinc-700 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#f97316]" aria-hidden="true">
              local_mall
            </span>
            <span>{t.publicMarketplace}</span>
          </Button>

          <Button
            type="button"
            onClick={onOpenNewProduct}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-orange text-white text-xs font-extrabold shadow-md hover:shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add_circle</span>
            <span>{t.newProduct}</span>
          </Button>
        </div>
      </Reveal>

      {/* 4 Minimalist Metric Cards */}
      <Stagger delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <StaggerItem variant="card">
        <div className="card-motion h-full bg-white p-5 rounded-3xl shadow-xs border border-[#fed7aa]/60 hover:border-[#ea580c]/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748b]">Références Actives</span>
            <div className="text-2xl font-black text-[#0f172a] mt-1">
              {products.length} <span className="text-xs font-normal text-[#64748b]">SKUs</span>
            </div>
            <span className="text-[11px] text-[#16a34a] font-bold">100% catalogués</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center border border-[#fed7aa]">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
        </div>
        </StaggerItem>

        {/* Stock Volume */}
        <StaggerItem variant="card">
        <div className="card-motion h-full bg-white p-5 rounded-3xl shadow-xs border border-[#fed7aa]/60 hover:border-[#ea580c]/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748b]">Unités Physiques</span>
            <div className="text-2xl font-black text-[#0f172a] mt-1">
              {totalStockUnits} <span className="text-xs font-normal text-[#64748b]">{t.units}</span>
            </div>
            <span className="text-[11px] text-[#64748b]">En entrepôt Abidjan</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center border border-[#fed7aa]">
            <span className="material-symbols-outlined text-[24px]">shelves</span>
          </div>
        </div>
        </StaggerItem>

        {/* Stock Value in XOF */}
        <StaggerItem variant="card">
        <div className="card-motion h-full bg-white p-5 rounded-3xl shadow-xs border border-[#fed7aa]/60 hover:border-[#ea580c]/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748b]">Valeur Marchande</span>
            <div className="text-xl font-black text-[#0f172a] mt-1">
              {totalStockValueXOF.toLocaleString()} <span className="text-xs font-bold text-[#ea580c]">XOF</span>
            </div>
            <span className="text-[11px] text-[#16a34a] font-bold">Prix public garanti</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center border border-[#fed7aa]">
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </div>
        </div>
        </StaggerItem>

        {/* Low Stock Alerts */}
        <StaggerItem variant="card">
        <div className="card-motion h-full bg-white p-5 rounded-3xl shadow-xs border border-[#fed7aa]/60 hover:border-[#ea580c]/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748b]">Alertes Stock Bas</span>
            <div className="text-2xl font-black text-[#ea580c] mt-1">
              {lowStockCount + outOfStockCount}{' '}
              <span className="text-xs font-normal text-[#64748b]">critiques</span>
            </div>
            <span className="text-[11px] text-[#c2410c] font-bold">
              {outOfStockCount > 0 ? `${outOfStockCount} en rupture` : 'Réapprovisionner'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#ffedd5] text-[#c2410c] flex items-center justify-center border border-[#fed7aa]">
            <span className="material-symbols-outlined text-[24px]">notification_important</span>
          </div>
        </div>
        </StaggerItem>
      </Stagger>

      {/* Control Console: Search & Filter Tabs */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#fed7aa]/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par SKU, nom du produit..."
            className="w-full pl-10 pr-4 py-2 bg-[#fffaf5] text-[#0f172a] text-xs font-medium rounded-2xl border border-[#fed7aa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Tous les articles' },
            { id: 'low_stock', label: `Stock Faible (< 10)` },
            { id: 'out_of_stock', label: `Ruptures (${outOfStockCount})` },
            { id: 'online', label: 'En Ligne' },
            { id: 'hidden', label: 'Masqués' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap btn-motion ${
                filterMode === tab.id
                  ? 'bg-gradient-orange text-white shadow-xs'
                  : 'bg-[#fffaf5] text-[#64748b] hover:text-[#0f172a] border border-[#fed7aa]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Management Table (List View) */}
      <div className="bg-white rounded-3xl shadow-xs border border-[#fed7aa]/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fffaf5] text-[#64748b] uppercase font-bold tracking-wider border-b border-[#fed7aa]/60 select-none">
              <tr>
                <th className="py-3.5 px-5">Produit & Référence</th>
                <th className="py-3.5 px-4">Prix Unitaire</th>
                <th className="py-3.5 px-4">Niveau de Stock</th>
                <th className="py-3.5 px-4 text-center">Ajuster Stock</th>
                <th className="py-3.5 px-4 text-center">Visibilité</th>
                <th className="py-3.5 pr-5 text-right">Action Rapide</th>
              </tr>
            </thead>
            <m.tbody
              variants={rowsVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-[#fed7aa]/40"
            >
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-5 text-center text-[#64748b]">
                    <span className="material-symbols-outlined text-[32px] text-[#ea580c] block mb-2" aria-hidden="true">
                      inventory_2
                    </span>
                    <span className="text-xs font-semibold">
                      {products.length === 0
                        ? `Aucun produit dans ${seller.shopName} pour le moment. Cliquez sur « ${t.newProduct} » pour commencer.`
                        : 'Aucun produit ne correspond à ce filtre.'}
                    </span>
                  </td>
                </tr>
              )}
              {filteredProducts.map((p) => {
                const stockPercent = Math.min(100, Math.round((p.stock / p.maxStock) * 100));
                const isLow = p.stock > 0 && p.stock < 10;
                const isZero = p.stock <= 0;

                return (
                  <m.tr key={p.id} variants={fadeIn} className="hover:bg-[#fffaf5]/70 transition-colors">
                    {/* Item */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <SmartImage
                          src={p.image}
                          alt={p.name}
                          wrapperClassName="w-12 h-12 rounded-xl bg-[#fffaf5] border border-[#fed7aa]/50 shrink-0"
                          className="w-full h-full object-contain p-1"
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-[#0f172a] block text-xs truncate max-w-xs">
                            {lang === 'FR' ? p.name : p.nameEn}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-0.5">
                            <span className="font-mono text-[#ea580c] font-bold">
                              {p.sku}
                            </span>
                            <span>•</span>
                            <span>{p.category}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-black text-[#0f172a] whitespace-nowrap">
                      {p.price.toLocaleString()} XOF
                    </td>

                    {/* Stock Meter */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 w-36">
                        <div className="flex justify-between text-[11px]">
                          <span
                            className={`font-black ${
                              isZero
                                ? 'text-[#dc2626]'
                                : isLow
                                ? 'text-[#c2410c]'
                                : 'text-[#16a34a]'
                            }`}
                          >
                            {p.stock} / {p.maxStock} {t.units}
                          </span>
                          <span className="text-[10px] text-[#94a3b8]">
                            {stockPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#fed7aa]/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isZero
                                ? 'bg-[#dc2626]'
                                : isLow
                                ? 'bg-[#ea580c]'
                                : 'bg-[#16a34a]'
                            }`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Inline Stock Adjustment Controls */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-[#fffaf5] p-1 rounded-2xl border border-[#fed7aa]">
                        <button
                          onClick={() => handleStockDelta(p.id, p.stock, -1)}
                          className="w-7 h-7 rounded-xl bg-white hover:bg-[#ffedd5] flex items-center justify-center font-bold text-xs shadow-xs text-[#0f172a]"
                          title="Retirer 1 unité"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={p.stock}
                          min={0}
                          step={1}
                          inputMode="numeric"
                          aria-label={`Stock de ${p.name}`}
                          onChange={(e) =>
                            onUpdateProductStock(p.id, Math.max(0, Math.floor(Number(e.target.value) || 0)))
                          }
                          className="w-12 text-center text-xs font-black text-[#0f172a] bg-transparent focus:outline-none"
                        />
                        <button
                          onClick={() => handleStockDelta(p.id, p.stock, 1)}
                          className="w-7 h-7 rounded-xl bg-white hover:bg-[#ffedd5] flex items-center justify-center font-bold text-xs shadow-xs text-[#0f172a]"
                          title="Ajouter 1 unité"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Visibility Switch */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onToggleProductVisibility(p.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          p.visibility
                            ? 'bg-[#dcfce7] text-[#16a34a]'
                            : 'bg-[#fee2e2] text-[#dc2626]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.visibility ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                          }`}
                        />
                        <span>{p.visibility ? t.visibilityOnline : t.visibilityHidden}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleReplenish(p)}
                        className="px-3 py-1.5 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] text-xs font-bold border border-[#fed7aa] btn-motion inline-flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          add
                        </span>
                        <span>+25 unités</span>
                      </button>
                    </td>
                  </m.tr>
                );
              })}
            </m.tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
