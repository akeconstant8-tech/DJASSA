import React, { useState, useMemo } from 'react';
import { Product, Language } from '../types';
import { DJASSA_LOGO, translations } from '../data/mockData';

interface CustomerCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  lang: Language;
  globalSearch: string;
}

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({
  products,
  onAddToCart,
  lang,
  globalSearch
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  // Category counts
  const categoriesList = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.visibility) return false;

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Price
      if (p.price > maxPrice) return false;

      // Stock
      if (stockFilter === 'in_stock' && p.stock <= 0) return false;
      if (stockFilter === 'low_stock' && (p.stock <= 0 || p.stock >= 10)) return false;

      // Search
      if (globalSearch) {
        const q = globalSearch.toLowerCase();
        const matchName = (p.name + ' ' + p.nameEn).toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      return true;
    });
  }, [products, selectedCategory, maxPrice, stockFilter, globalSearch]);

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }
    return list;
  }, [filteredProducts, sortBy]);

  const handleAddToCart = (product: Product) => {
    onAddToCart(product);
    setToastMessage(
      lang === 'FR'
        ? `${product.name} ajouté au panier !`
        : `${product.nameEn} added to cart!`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setMaxPrice(150000);
    setStockFilter('all');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3 animate-in fade-in duration-200 border border-[#ea580c]">
          <div className="w-7 h-7 rounded-full bg-gradient-orange text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">check</span>
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Welcome Minimalist Banner with black gradient (dégradé noir) & official logo */}
      <div className="mb-8 rounded-3xl p-6 sm:p-8 bg-gradient-dark text-white border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-[#f97316] text-xs font-extrabold shadow-xs mb-3 border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
            <span>Djassa Market • Marketplace UEMOA 100% XOF</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {t.catalogTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
            {t.catalogSubtitle}
          </p>
          <div className="flex items-center gap-3 mt-4 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1 text-[#f97316]">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Vendeurs Certifiés
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-white">
              <span className="material-symbols-outlined text-[16px] text-[#f97316]">local_shipping</span>
              Livraison 24h/48h
            </span>
          </div>
        </div>

        {/* Official Djassa Market 3D Logo Showcase */}
        <div className="relative z-10 shrink-0 flex items-center justify-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-zinc-900/90 p-2 shadow-[0_10px_30px_rgba(234,88,12,0.25)] border-2 border-[#ea580c]/50 relative group">
            <img
              src={DJASSA_LOGO}
              alt="Djassa Market Official Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Filters + Products */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-5">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#fed7aa]/60 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#fed7aa]/50 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0f172a]">
                <span className="material-symbols-outlined text-[#ea580c] text-[20px]">
                  tune
                </span>
                <span>{t.filters}</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#ea580c] hover:underline"
              >
                {t.resetFilters}
              </button>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">
                {t.categories}
              </span>
              <div className="flex flex-col gap-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-[#fff7ed] text-[#ea580c] font-bold border border-[#fed7aa]'
                      : 'text-[#64748b] hover:bg-[#fffaf5]'
                  }`}
                >
                  <span>{t.all}</span>
                  <span className="text-[11px] text-[#94a3b8]">{products.length}</span>
                </button>

                {categoriesList.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-[#fff7ed] text-[#ea580c] font-bold border border-[#fed7aa]'
                        : 'text-[#64748b] hover:bg-[#fffaf5]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-[#94a3b8]">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider in XOF */}
            <div className="flex flex-col gap-2 border-t border-[#fed7aa]/50 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#0f172a] uppercase tracking-wider">
                  {t.priceRange}
                </span>
                <span className="font-bold text-[#ea580c]">
                  ≤ {maxPrice.toLocaleString()} XOF
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="150000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#ea580c] h-1.5 bg-[#fed7aa] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94a3b8]">
                <span>10 000 XOF</span>
                <span>150 000 XOF</span>
              </div>
            </div>

            {/* Stock status */}
            <div className="flex flex-col gap-2 border-t border-[#fed7aa]/50 pt-4">
              <span className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">
                {t.stockStatus}
              </span>
              <div className="flex flex-col gap-1.5 text-xs text-[#64748b]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockFilter === 'all'}
                    onChange={() => setStockFilter('all')}
                    className="accent-[#ea580c]"
                  />
                  <span>{t.all}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockFilter === 'in_stock'}
                    onChange={() => setStockFilter('in_stock')}
                    className="accent-[#ea580c]"
                  />
                  <span>{t.onlyInStock}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockFilter === 'low_stock'}
                    onChange={() => setStockFilter('low_stock')}
                    className="accent-[#ea580c]"
                  />
                  <span>{t.lowStockOnly}</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area: Products */}
        <div className="flex-1 w-full flex flex-col gap-5">
          {/* Controls Bar: Sort, Counts & Grid/List switcher */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#fed7aa]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#64748b]">
              <strong className="text-[#0f172a] font-extrabold">{sortedProducts.length}</strong>{' '}
              {lang === 'FR' ? 'articles disponibles' : 'items available'}
            </span>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#64748b] hidden sm:inline">{t.sortBy}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#fffaf5] text-[#0f172a] text-xs font-bold py-1.5 px-3 rounded-xl border border-[#fed7aa] focus:outline-none cursor-pointer"
                >
                  <option value="popular">{t.popular}</option>
                  <option value="price_asc">{t.priceAsc}</option>
                  <option value="price_desc">{t.priceDesc}</option>
                  <option value="rating">{t.bestRated}</option>
                </select>
              </div>

              {/* Grid / List Switcher */}
              <div className="flex items-center bg-[#fffaf5] p-1 rounded-xl border border-[#fed7aa]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'grid'
                      ? 'bg-gradient-orange text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                  title={t.viewGrid}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'list'
                      ? 'bg-gradient-orange text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                  title={t.viewList}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Products Display: Grid or List Mode */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => {
                const isLowStock = product.stock > 0 && product.stock < 10;
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl p-4 shadow-xs hover:shadow-xl border border-[#fed7aa]/60 hover:border-[#ea580c]/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Frame */}
                      <div className="relative w-full h-52 bg-gradient-orange-subtle rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-[#fed7aa]/30">
                        <img
                          src={product.image}
                          alt={lang === 'FR' ? product.name : product.nameEn}
                          className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Stock status badge */}
                        <div className="absolute top-3 left-3">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#dc2626] text-[10px] font-extrabold uppercase tracking-wide">
                              {t.outOfStock}
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#c2410c] text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
                              {product.stock} {t.units} restants
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#16a34a] text-[10px] font-extrabold uppercase tracking-wide">
                              {t.inStock}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="pt-4 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                          <span className="font-mono">SKU: {product.sku}</span>
                          <span>{product.category}</span>
                        </div>

                        <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#ea580c] transition-colors line-clamp-1">
                          {lang === 'FR' ? product.name : product.nameEn}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 text-[11px] text-[#f59e0b]">
                          <span className="material-symbols-outlined text-[15px] material-symbols-filled">
                            star
                          </span>
                          <span className="font-bold text-[#0f172a]">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-[#94a3b8]">({product.reviewsCount})</span>
                        </div>

                        {/* Price in XOF */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-lg font-black text-[#0f172a]">
                            {product.price.toLocaleString()} XOF
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-[#94a3b8] line-through">
                              {product.originalPrice.toLocaleString()} XOF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart CTA Button */}
                    <button
                      disabled={isOutOfStock}
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-4 py-2.5 rounded-2xl bg-gradient-orange hover:bg-gradient-to-r hover:from-[#c2410c] hover:to-[#ea580c] disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        shopping_bag
                      </span>
                      <span>{t.addToCart}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View Mode (like Image 2 & requested by user) */
            <div className="bg-white rounded-3xl shadow-xs border border-[#fed7aa]/60 overflow-hidden">
              <div className="divide-y divide-[#fed7aa]/40">
                {sortedProducts.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock < 10;
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <div
                      key={product.id}
                      className="p-4 sm:p-5 hover:bg-[#fffaf5] transition-colors flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-20 h-20 bg-gradient-orange-subtle rounded-2xl p-2 shrink-0 border border-[#fed7aa]/30 flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
                            <span className="font-mono">SKU: {product.sku}</span>
                            <span>•</span>
                            <span>{product.category}</span>
                          </div>
                          <h4 className="text-sm font-bold text-[#0f172a] truncate">
                            {lang === 'FR' ? product.name : product.nameEn}
                          </h4>
                          <p className="text-xs text-[#64748b] line-clamp-1">
                            {lang === 'FR' ? product.description : product.descriptionEn}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-extrabold text-[#0f172a]">
                              {product.price.toLocaleString()} XOF
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isOutOfStock
                                  ? 'bg-[#fee2e2] text-[#dc2626]'
                                  : isLowStock
                                  ? 'bg-[#ffedd5] text-[#c2410c]'
                                  : 'bg-[#dcfce7] text-[#16a34a]'
                              }`}
                            >
                              {isOutOfStock
                                ? t.outOfStock
                                : `${product.stock} ${t.units}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex items-center justify-end">
                        <button
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-orange hover:bg-gradient-to-r hover:from-[#c2410c] hover:to-[#ea580c] disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            shopping_bag
                          </span>
                          <span>{t.addToCart}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
