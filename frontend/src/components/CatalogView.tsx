import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface CatalogViewProps {
  products: Product[];
  onToggleVisibility: (productId: string) => void;
  onEditProduct: (product: Product) => void;
  onOpenNewProduct: () => void;
  globalSearch: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onToggleVisibility,
  onEditProduct,
  onOpenNewProduct,
  globalSearch
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Electronics');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(250000);
  const [localSearch, setLocalSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('sales');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const effectiveSearch = localSearch || globalSearch;

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (selectedCategory && selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Status
      if (selectedStatus === 'online' && p.status !== 'online') return false;
      if (selectedStatus === 'draft' && p.status !== 'draft') return false;
      if (selectedStatus === 'moderation' && p.status !== 'moderation') return false;

      // Availability
      if (selectedAvailability === 'in_stock' && p.stock <= 0) return false;
      if (selectedAvailability === 'low_stock' && (p.stock <= 0 || p.stock >= 10)) return false;

      // Price
      if (p.price > maxPrice) return false;

      // Search query
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        if (!matchesName && !matchesSku && !matchesCat) return false;
      }

      return true;
    });
  }, [
    products,
    selectedCategory,
    selectedStatus,
    selectedAvailability,
    maxPrice,
    effectiveSearch
  ]);

  // Sort
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock') {
      list.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [filteredProducts, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedAvailability('all');
    setMaxPrice(300000);
    setLocalSearch('');
  };

  const exportCSV = () => {
    const headers = ['ID', 'SKU', 'Nom', 'Categorie', 'Prix', 'Stock', 'Statut'];
    const rows = sortedProducts.map((p) => [
      p.id,
      p.sku,
      `"${p.name}"`,
      p.category,
      p.price,
      p.stock,
      p.status
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'catalogue_djassa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Export CSV du catalogue téléchargé avec succès.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#213145] text-[#eaf1ff] px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-7 h-7 rounded-full bg-[#00a685] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">check</span>
          </div>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Operational Header */}
      <div className="px-6 py-4 bg-white border-b border-[#e5eeff] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006b55]/10 text-[#006b55] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-[#0b1c30]">
                Catalogue Produits
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#3d4a44] text-xs font-semibold">
                342 articles
              </span>
            </div>
            <p className="text-xs text-[#6d7a74]">
              Supervisez votre inventaire, stocks physiques et visibilité boutique en temps réel
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#dce9ff] transition-colors border border-[#e5eeff]"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">file_download</span>
            <span>Exporter</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#dce9ff] transition-colors border border-[#e5eeff] cursor-pointer">
            <span className="material-symbols-outlined text-[17px]">upload_file</span>
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={() => {
                setToastMessage('Fichier CSV analysé. 14 nouvelles références prêtes.');
                setTimeout(() => setToastMessage(null), 3500);
              }}
            />
          </label>

          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a685] hover:bg-[#006b55] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nouveau produit</span>
          </button>
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="px-6 py-6 flex flex-col lg:flex-row items-start gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#0b1c30] font-bold text-sm">
                <span className="material-symbols-outlined text-[#006b55] text-[19px]">
                  filter_list
                </span>
                <span>Filtres</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[#006b55] hover:underline text-xs font-semibold"
                type="button"
              >
                Réinitialiser
              </button>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider">
                Catégories
              </span>
              <div className="flex flex-col gap-1">
                {[
                  { name: 'Electronics', count: 148 },
                  { name: 'Fashion & Textile', count: 84 },
                  { name: 'Furniture & Deco', count: 52 },
                  { name: 'Foods & Agro', count: 36 },
                  { name: 'Outillage & Hardware', count: 22 }
                ].map((cat) => {
                  const isChecked = selectedCategory === cat.name;
                  return (
                    <label
                      key={cat.name}
                      onClick={() =>
                        setSelectedCategory(isChecked ? 'all' : cat.name)
                      }
                      className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-[#eff4ff] text-[#0b1c30] font-bold'
                          : 'hover:bg-[#eff4ff]/60 text-[#3d4a44]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#00a685] accent-[#00a685]"
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          isChecked
                            ? 'bg-white text-[#006b55] font-bold shadow-xs'
                            : 'text-[#6d7a74]'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-[1px] bg-[#e5eeff] w-full" />

            {/* Price Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider">
                  Fourchette de Prix
                </span>
                <span className="text-[#006b55] font-bold">
                  0 - {maxPrice.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#00a685] h-1.5 bg-[#e5eeff] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6d7a74]">
                  <span>5 000 F</span>
                  <span>150 000 F</span>
                  <span>300 000 F</span>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[#e5eeff] w-full" />

            {/* Stock Availability */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider">
                Disponibilité Stock
              </span>
              <div className="flex flex-col gap-1.5 text-xs text-[#3d4a44]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={selectedAvailability === 'all'}
                    onChange={() => setSelectedAvailability('all')}
                    className="w-4 h-4 accent-[#00a685]"
                  />
                  <span>Tous les articles</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={selectedAvailability === 'in_stock'}
                    onChange={() => setSelectedAvailability('in_stock')}
                    className="w-4 h-4 accent-[#00a685]"
                  />
                  <span>En stock uniquement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={selectedAvailability === 'low_stock'}
                    onChange={() => setSelectedAvailability('low_stock')}
                    className="w-4 h-4 accent-[#00a685]"
                  />
                  <span>Faible stock (&lt; 10)</span>
                </label>
              </div>
            </div>

            <div className="h-[1px] bg-[#e5eeff] w-full" />

            {/* Publication Status */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider">
                Statut Publication
              </span>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <button
                  onClick={() =>
                    setSelectedStatus(selectedStatus === 'online' ? 'all' : 'online')
                  }
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    selectedStatus === 'online'
                      ? 'bg-[#eff4ff] text-[#0b1c30] font-bold'
                      : 'hover:bg-[#eff4ff]/60 text-[#3d4a44]'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00a685]" />
                    <span>En ligne</span>
                  </div>
                  <span className="text-xs text-[#6d7a74]">308</span>
                </button>
                <button
                  onClick={() =>
                    setSelectedStatus(selectedStatus === 'draft' ? 'all' : 'draft')
                  }
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    selectedStatus === 'draft'
                      ? 'bg-[#eff4ff] text-[#0b1c30] font-bold'
                      : 'hover:bg-[#eff4ff]/60 text-[#3d4a44]'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6d7a74]" />
                    <span>Brouillons</span>
                  </div>
                  <span className="text-xs text-[#6d7a74]">24</span>
                </button>
                <button
                  onClick={() =>
                    setSelectedStatus(
                      selectedStatus === 'moderation' ? 'all' : 'moderation'
                    )
                  }
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    selectedStatus === 'moderation'
                      ? 'bg-[#eff4ff] text-[#0b1c30] font-bold'
                      : 'hover:bg-[#eff4ff]/60 text-[#3d4a44]'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#cc8200]" />
                    <span>En modération</span>
                  </div>
                  <span className="text-xs text-[#6d7a74]">10</span>
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-[#e5eeff] w-full" />

            {/* Delivery Options */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider">
                Options Livraison
              </span>
              <div className="flex flex-col gap-1.5 text-xs text-[#3d4a44]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded accent-[#00a685]"
                  />
                  <span>Djassa Express (Abidjan 24h)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded accent-[#00a685]"
                  />
                  <span>Retrait en Point Relais</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-[#00a685]"
                  />
                  <span>Expédition Nationale</span>
                </label>
              </div>
            </div>
          </div>

          {/* SEO Helper Banner */}
          <div className="bg-[#006b55]/5 border border-[#006b55]/15 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#006b55]/10 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#006b55] text-[20px]">
                help_outline
              </span>
              <span className="text-xs text-[#0b1c30] font-bold">
                Guide d'optimisation SEO
              </span>
            </div>
            <span className="material-symbols-outlined text-[#6d7a74] text-[16px]">
              chevron_right
            </span>
          </div>
        </aside>

        {/* Right Content Area: Search, Pills, Product Grid */}
        <div className="flex-1 w-full flex flex-col gap-4">
          {/* Top Filter Bar */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#e5eeff] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6d7a74] text-[18px]">
                search
              </span>
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Rechercher par nom de produit, SKU ou tag..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#6d7a74] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00a685]/30 border border-transparent focus:border-[#00a685] transition-all"
                type="text"
              />
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6d7a74] whitespace-nowrap">Trier par :</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none border border-[#e5eeff]"
                  >
                    <option value="sales">Meilleures ventes</option>
                    <option value="price_desc">Prix décroissant</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="stock">Niveau de stock</option>
                    <option value="rating">Meilleures notes</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] pointer-events-none text-[#6d7a74]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Grid / List toggle */}
              <div className="flex items-center bg-[#eff4ff] p-0.5 rounded-xl border border-[#e5eeff]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#006b55] shadow-xs font-bold'
                      : 'text-[#6d7a74] hover:text-[#0b1c30]'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-[#006b55] shadow-xs font-bold'
                      : 'text-[#6d7a74] hover:text-[#0b1c30]'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6d7a74]">Filtres actifs :</span>
            {selectedCategory !== 'all' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#99efe5]/40 text-[#006f67] text-xs font-semibold">
                <span>Catégorie : {selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-[#ba1a1a] flex items-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            {selectedStatus !== 'all' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#99efe5]/40 text-[#006f67] text-xs font-semibold">
                <span>
                  Statut :{' '}
                  {selectedStatus === 'online'
                    ? 'En ligne'
                    : selectedStatus === 'draft'
                    ? 'Brouillons'
                    : 'En modération'}
                </span>
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="hover:text-[#ba1a1a] flex items-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            {effectiveSearch && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#99efe5]/40 text-[#006f67] text-xs font-semibold">
                <span>Recherche : "{effectiveSearch}"</span>
                <button
                  onClick={() => setLocalSearch('')}
                  className="hover:text-[#ba1a1a] flex items-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#006b55] hover:underline ml-1 font-semibold"
              type="button"
            >
              Effacer tout
            </button>
          </div>

          {/* Product Cards Grid or List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedProducts.map((product) => {
                const stockPercent = Math.min(
                  100,
                  Math.round((product.stock / product.maxStock) * 100)
                );
                return (
                  <div
                    key={product.id}
                    className={`group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-[#e5eeff] transition-all flex flex-col justify-between ${
                      !product.visibility ? 'opacity-85' : ''
                    }`}
                  >
                    <div>
                      {/* Image slot */}
                      <div className="relative w-full h-52 bg-[#eff4ff] flex items-center justify-center p-4 overflow-hidden">
                        <img
                          alt={product.name}
                          className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
                          src={product.image}
                        />
                        {/* Status Tag */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur text-xs font-semibold text-[#0b1c30] shadow-xs">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              product.status === 'online'
                                ? 'bg-[#00a685]'
                                : product.status === 'draft'
                                ? 'bg-[#6d7a74]'
                                : 'bg-[#cc8200]'
                            }`}
                          />
                          <span>
                            {product.status === 'online'
                              ? 'En ligne'
                              : product.status === 'draft'
                              ? 'Brouillon'
                              : 'En modération'}
                          </span>
                        </div>
                        {/* Overflow action */}
                        <button
                          onClick={() => onEditProduct(product)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-[#6d7a74] hover:text-[#0b1c30] flex items-center justify-center shadow-xs transition-colors"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            more_vert
                          </span>
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[#6d7a74] text-xs">
                          <span>SKU: {product.sku}</span>
                          <span>{product.subCategory || product.category}</span>
                        </div>
                        <h2 className="text-sm font-bold text-[#0b1c30] group-hover:text-[#006b55] transition-colors line-clamp-1">
                          {product.name}
                        </h2>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-base font-bold text-[#0b1c30]">
                              {product.price.toLocaleString()} {product.currency}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-[#6d7a74] line-through ml-1.5">
                                {product.originalPrice.toLocaleString()} F
                              </span>
                            )}
                          </div>
                          {product.rating > 0 ? (
                            <div className="flex items-center gap-1 text-[#cc8200] text-xs">
                              <span className="material-symbols-outlined text-[16px] text-[#cc8200]">
                                star
                              </span>
                              <span className="text-[#0b1c30] font-bold">
                                {product.rating.toFixed(1)}
                              </span>
                              <span className="text-[#6d7a74]">
                                ({product.reviewsCount})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#6d7a74] text-xs">
                              <span className="material-symbols-outlined text-[16px]">
                                star
                              </span>
                              <span>-- (0)</span>
                            </div>
                          )}
                        </div>

                        {/* Stock Progress Bar */}
                        <div className="mt-2 p-2.5 rounded-xl bg-[#eff4ff] flex flex-col gap-1.5 border border-[#e5eeff]/50">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#3d4a44] font-medium">
                              Stock disponible
                            </span>
                            <span
                              className={`font-bold ${
                                product.stock < 10 ? 'text-[#855300]' : 'text-[#006b55]'
                              }`}
                            >
                              {product.stock} / {product.maxStock} unités
                              {product.stock < 10 && ' (Faible)'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#dce9ff] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                product.stock < 10
                                  ? 'bg-[#cc8200]'
                                  : 'bg-[#00a685]'
                              }`}
                              style={{ width: `${stockPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6d7a74]">Visibilité</span>
                        <button
                          onClick={() => onToggleVisibility(product.id)}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                            product.visibility ? 'bg-[#00a685]' : 'bg-[#bccac3]'
                          }`}
                          type="button"
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                              product.visibility ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <button
                        onClick={() => onEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#00a685] text-white text-xs font-bold shadow-xs hover:bg-[#006b55] transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Modifier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl shadow-xs border border-[#e5eeff] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#6d7a74] uppercase tracking-wider font-semibold border-b border-[#e5eeff]">
                  <tr>
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Catégorie</th>
                    <th className="py-3 px-3">Prix</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3">Visibilité</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {sortedProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#eff4ff]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded-lg bg-[#eff4ff] p-1 border border-[#e5eeff]"
                            src={p.image}
                          />
                          <div>
                            <span className="font-bold text-[#0b1c30] text-xs">
                              {p.name}
                            </span>
                            <div className="text-[11px] text-[#6d7a74]">
                              {p.rating > 0 ? `★ ${p.rating.toFixed(1)} (${p.reviewsCount})` : 'Aucun avis'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#6d7a74]">{p.sku}</td>
                      <td className="py-3 px-3 text-[#0b1c30]">{p.category}</td>
                      <td className="py-3 px-3 font-bold text-[#0b1c30]">
                        {p.price.toLocaleString()} {p.currency}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            p.stock < 10 ? 'text-[#855300]' : 'text-[#006b55]'
                          }`}
                        >
                          {p.stock} unités
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            p.status === 'online'
                              ? 'bg-[#99efe5]/40 text-[#006f67]'
                              : 'bg-[#eff4ff] text-[#6d7a74]'
                          }`}
                        >
                          {p.status === 'online' ? 'En ligne' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onToggleVisibility(p.id)}
                          className={`w-9 h-4 rounded-full p-0.5 transition-colors relative flex items-center ${
                            p.visibility ? 'bg-[#00a685]' : 'bg-[#bccac3]'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                              p.visibility ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="px-3 py-1 bg-[#eff4ff] hover:bg-[#00a685] hover:text-white rounded-lg font-bold text-[#006b55] transition-colors"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs text-[#6d7a74]">
              <span>Affichage de 1 à {sortedProducts.length} sur 342 références</span>
              <span className="w-1 h-1 rounded-full bg-[#bccac3]" />
              <span>Afficher par</span>
              <select className="bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold rounded-lg px-2 py-1 outline-none border border-[#e5eeff]">
                <option>12</option>
                <option>24</option>
                <option>48</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#6d7a74] hover:text-[#0b1c30] flex items-center justify-center disabled:opacity-40"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shadow-xs ${
                  currentPage === 1
                    ? 'bg-[#00a685] text-white'
                    : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
                type="button"
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
                  currentPage === 2
                    ? 'bg-[#00a685] text-white'
                    : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
                type="button"
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
                  currentPage === 3
                    ? 'bg-[#00a685] text-white'
                    : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
                type="button"
              >
                3
              </button>
              <span className="px-1 text-[#6d7a74] text-xs">...</span>
              <button
                onClick={() => setCurrentPage(29)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
                  currentPage === 29
                    ? 'bg-[#00a685] text-white'
                    : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
                type="button"
              >
                29
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(29, p + 1))}
                className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff] flex items-center justify-center"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
