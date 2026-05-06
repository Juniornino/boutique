import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

export function ImportNewProduct({
  importMode,
  newProductName, setNewProductName,
  newProductCategory, setNewProductCategory,
  newProductPrice, setNewProductPrice,
  newProductPromotionalPrice, setNewProductPromotionalPrice,
  newProductDescription, setNewProductDescription,
  importImageFile, importImagePreview, onPickImage,
}) {
  const imageRef = useRef(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nom du produit <span className="text-rose-500">*</span></label>
          <input type="text" required={importMode === 'NEW'} value={newProductName} onChange={(e) => setNewProductName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="Ex: Windows 11 Pro" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Prix (FCFA) <span className="text-rose-500">*</span></label>
          <input type="number" required={importMode === 'NEW'} min="0" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="Ex: 15000" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Prix promotionnel <span className="font-normal normal-case text-slate-400">(optionnel)</span></label>
          <input type="number" min="0" value={newProductPromotionalPrice} onChange={(e) => setNewProductPromotionalPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="Ex: 12000" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Catégorie <span className="text-rose-500">*</span></label>
          <select value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100">
            <option value="OS">Système d'exploitation (OS)</option>
            <option value="OFFICE">Bureautique (OFFICE)</option>
            <option value="SECURITY">Sécurité / Antivirus (SECURITY)</option>
            <option value="UTILITY">Utilitaire (UTILITY)</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description <span className="text-rose-500">*</span></label>
        <textarea required={importMode === 'NEW'} value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-y" placeholder="Description visible par les clients..." />
      </div>

      <div>
        <div className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Image du produit <span className="text-rose-500">*</span></div>
        <div
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); imageRef.current?.click(); } }}
          onClick={() => imageRef.current?.click()}
          className="flex flex-col gap-3 cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/80 p-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-blue-600"><Upload size={22} /></div>
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-slate-800">JPEG, PNG, WebP ou GIF — max 5 Mo</p>
              <p className="text-slate-500 text-xs mt-0.5">Visible sur la fiche produit.</p>
            </div>
          </div>
          <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onPickImage} />
        </div>
        {importImagePreview && (
          <div className="mt-3 flex gap-4 items-start">
            <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0">
              <img src={importImagePreview} alt="" className="w-full h-full object-cover" />
            </div>
            {importImageFile && <p className="text-xs text-slate-600 break-all pt-1">{importImageFile.name}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
