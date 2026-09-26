import React, { useState } from 'react';
import { Product } from '../types';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const PRESET_IMAGES = [
  {
    name: 'Clavier',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDS5iiXGMUjbKnOxSDp5eMwoYunxaRrXjiU_I8HyNZeRhlmoRxEd9E6cuB-NBJ6UPy1jMnxVc9pKUbR_qmxkgjh0cRyeycSPtlJhC22KCLIu3yyhDyDOfR38tobCXANY9WqrPRxGcSOo_b-D9HVrstTFt4wSm-M-wFwOTtqIE9rM4-PQpRcO-n_No3zm2pTMPh43jR-MrdUsArx9b3bmHuXLks2Okon-NRqcFhgHbEzvyqcWpXES0j'
  },
  {
    name: 'Souris',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK5dNu1OaRbz_q9F25Dg1PZoB14voUFCp6AZzlMXEonsgvrOGgGorj_hlA6IsVx2O1pWT9T-Hnwtv-xEbPO_ThdjXTG4i6N0gL0Sl9U5BJvzUPz6MKT852MRTmYMY4E-_y6M6uqO5hej2mPEyFo72h4S2IRLF-PuVtNUAudS2EsFUzKh00DGXWLc__QTip-cKb3-4fHA1OjI6a3dPdmY2J-xp4IEtjSkWPkWq1atK4UKZUFD1vr6Jk'
  },
  {
    name: 'Casque',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpPq4LD9UlbmDefUE_1_i51MqRc-En5xjwE486lL0dOLC4fwdukqcgLpuxdKt8oJe1wt5DGXlhGC_hMgvuKldU7cbmTeke2DIkxsQBcrm7nNLvKUYHTgyUuwmqoEtAXJaarLRFGbCPD_0ZfyZiQ804jb6umOalj2cYAo3K8ZpaB6S_qeWmwFIfZgAFM3fg40etRYAqIpULC63HIlTvzQNmDR5x5Tmw2SIFDcq-XHtSzkcmSV5W9KTd'
  },
  {
    name: 'Manette',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7VAmfY5Gx72LdCVCos2PMNlzUZdDW2FzxCz5dEoWBYOXEai9BxNNv3DDI-XZKOllhvO7IF_Pkpx3UP9ZQAoVVjxYSI4xLwBlRJvlSnL1Au29mXtrH0R8DoEnf5gx9SgJJhvSLCNvqPPqc88yRoHrbxNet-H8xtFPsBOusdOmssr9qklWp99lsOP6vKy1KiggJ7USpYbDyD63ImYz8R35LKzo2siqCMMwGrgtKJOM_9TOtIS0ZhY3K'
  },
  {
    name: 'Tissu Wax',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDW6tO5u4zWU8RvxpR4ZvIZ94Oprt3FtIVFbYOV9Xl0S2PY3f50l9NbowW90p0C16V2AtYutT8tWNp9dfCQ3ca-q816UpjN-77HBDg2LWNPgv0UeXMKU_JZvccP7VdS0RLqxBvXkcW7T2336Mw3IrtycZ85pG_P0AEyLZRBxv-tYTo_w0pjJsEYytmYN_Z48fJajftgXTfUY6u4RYIOXeMjcpScXisPkwAps66G0UuGw96f102tKlSE'
  }
];

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState(`EL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState(35000);
  const [stock, setStock] = useState(25);
  const [maxStock, setMaxStock] = useState(50);
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prod: Product = {
      id: `p-${Date.now()}`,
      sku,
      name: name.trim(),
      nameEn: name.trim(),
      category,
      price: Number(price) || 0,
      currency: 'XOF',
      stock: Number(stock) || 0,
      maxStock: Number(maxStock) || 50,
      status: 'online',
      visibility: true,
      image,
      rating: 5.0,
      reviewsCount: 1,
      description: description || name.trim(),
      descriptionEn: description || name.trim()
    };

    onSave(prod);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#fed7aa] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with black gradient & Djassa Market logo */}
        <div className="p-5 bg-gradient-dark text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-900 border border-zinc-700 p-0.5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-[#ea580c]">add_circle</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Ajouter une référence • Djassa Market
              </h2>
              <p className="text-[11px] text-zinc-400">
                Enregistrement dans l'inventaire vendeur (Devise : XOF)
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Preset image picker */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#0f172a]">Sélectionner un visuel HD</label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(img.url)}
                  className={`w-14 h-14 rounded-2xl p-1 bg-[#fffaf5] border shrink-0 transition-all ${
                    image === img.url
                      ? 'border-[#ea580c] ring-2 ring-[#ea580c]/30'
                      : 'border-[#fed7aa]/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#0f172a]">Nom du produit *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Écouteurs Pro ANC"
                className="p-3 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#0f172a]">Code SKU</label>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="p-3 rounded-2xl bg-[#fffaf5] font-mono border border-[#fed7aa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#0f172a]">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-3 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] focus:outline-none font-semibold cursor-pointer"
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion & Textile">Fashion & Textile</option>
                <option value="Furniture & Deco">Furniture & Deco</option>
                <option value="Foods & Agro">Foods & Agro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#0f172a]">Prix (XOF)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="p-3 rounded-2xl bg-[#fffaf5] font-black border border-[#fed7aa] focus:outline-none text-[#ea580c]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#0f172a]">Stock Initial</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="p-3 rounded-2xl bg-[#fffaf5] font-bold border border-[#fed7aa] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#0f172a]">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Caractéristiques de l'article..."
              className="p-3 rounded-2xl bg-[#fffaf5] border border-[#fed7aa] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#fed7aa]/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#64748b] hover:bg-[#fffaf5]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-orange hover:bg-gradient-to-r hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs font-black shadow-md transition-all active:scale-95"
            >
              Publier le produit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
