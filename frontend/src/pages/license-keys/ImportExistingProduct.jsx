import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

export function ImportExistingProduct({
  products, productKeys, importProductId, setImportProductId,
  importImageFile, importImagePreview, onPickImage,
}) {
  const imageRef = useRef(null);
  const selectedProduct = products.find((p) => p._id === importProductId);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 font-medium">
        Aucun produit existant. Basculez sur "Nouveau produit" pour en créer un.
      </div>
    );
  }

  return (
    <>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
        Produit à réapprovisionner <span className="text-rose-500">*</span>
      </label>
      <select
        value={importProductId}
        onChange={(e) => setImportProductId(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white"
      >
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — {p.category} ({productKeys[p._id]?.filter(k => k.status === 'AVAILABLE').length ?? '?'} dispo)
          </option>
        ))}
      </select>

      {selectedProduct && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200">
            {selectedProduct.image ? (
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400 font-bold text-xs">
                {selectedProduct.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 truncate">{selectedProduct.name}</p>
            <p className="text-xs text-slate-500">
              {selectedProduct.price?.toLocaleString('fr-FR')} FCFA · {selectedProduct.category}
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="text-xs font-bold text-emerald-600">
              {productKeys[selectedProduct._id]?.filter(k => k.status === 'AVAILABLE').length ?? 0} dispo
            </p>
            <p className="text-xs text-slate-400">
              {productKeys[selectedProduct._id]?.filter(k => k.status === 'SOLD').length ?? 0} vendues
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
          Mettre à jour l'image <span className="font-normal normal-case text-slate-400">(optionnel)</span>
        </div>
        <div
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); imageRef.current?.click(); } }}
          onClick={() => imageRef.current?.click()}
          className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-slate-200 hover:border-blue-300 bg-slate-50 px-4 py-3 transition-colors"
        >
          <Upload size={16} className="text-blue-500 shrink-0" />
          <span className="text-sm text-slate-500">
            {importImageFile ? importImageFile.name : 'Choisir une nouvelle image...'}
          </span>
          <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onPickImage} />
        </div>
      </div>
    </>
  );
}
