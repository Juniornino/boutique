import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, KeySquare, Loader2, Package, Plus } from 'lucide-react';
import { parseKeysBulk } from './parseKeysBulk';
import { ImportExistingProduct } from './ImportExistingProduct';
import { ImportNewProduct } from './ImportNewProduct';

export function ImportKeysModal({
  isOpen, importBusy, onClose, onSubmit,
  importMode, setImportMode,
  importProductId, setImportProductId,
  products, productKeys,
  importKeysText, setImportKeysText,
  importImageFile, importImagePreview, onPickImage,
  newProductName, setNewProductName,
  newProductCategory, setNewProductCategory,
  newProductPrice, setNewProductPrice,
  newProductPromotionalPrice, setNewProductPromotionalPrice,
  newProductDescription, setNewProductDescription,
}) {
  const keysFileRef = useRef(null);

  const handlePickKeysFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = /\.(txt|csv)$/i.test(file.name) || file.type === 'text/plain' || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
    if (!ok) return;
    try {
      const text = await file.text();
      setImportKeysText((prev) => (prev.trim() ? `${prev.trimEnd()}\n${text.trim()}` : text.trim()));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  return createPortal(
    isOpen ? (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="import-keys-title" onClick={() => !importBusy && onClose()}>
        <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={(ev) => ev.stopPropagation()}>
          <div className="sticky top-0 bg-white flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 rounded-t-3xl">
            <h2 id="import-keys-title" className="font-bold text-lg text-slate-900 pr-8">Ajouter des clés de licence</h2>
            <button type="button" onClick={onClose} disabled={importBusy} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 shrink-0" aria-label="Fermer"><X size={20} /></button>
          </div>

          <form onSubmit={onSubmit} className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button type="button" onClick={() => { setImportMode('EXISTING'); setImportProductId(products[0]?._id || ''); }} className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${importMode === 'EXISTING' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Package size={15} /> Produit existant
              </button>
              <button type="button" onClick={() => { setImportMode('NEW'); setImportProductId(''); }} className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${importMode === 'NEW' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Plus size={15} /> Nouveau produit
              </button>
            </div>

            {importMode === 'EXISTING' && (
              <div>
                <ImportExistingProduct products={products} productKeys={productKeys} importProductId={importProductId} setImportProductId={setImportProductId} importImageFile={importImageFile} importImagePreview={importImagePreview} onPickImage={onPickImage} />
              </div>
            )}

            {importMode === 'NEW' && (
              <ImportNewProduct
                importMode={importMode}
                newProductName={newProductName} setNewProductName={setNewProductName}
                newProductCategory={newProductCategory} setNewProductCategory={setNewProductCategory}
                newProductPrice={newProductPrice} setNewProductPrice={setNewProductPrice}
                newProductPromotionalPrice={newProductPromotionalPrice} setNewProductPromotionalPrice={setNewProductPromotionalPrice}
                newProductDescription={newProductDescription} setNewProductDescription={setNewProductDescription}
                importImageFile={importImageFile} importImagePreview={importImagePreview} onPickImage={onPickImage}
              />
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Clés à ajouter <span className="font-normal normal-case text-slate-400">(une par ligne ou CSV colonne A)</span></label>
              <textarea value={importKeysText} onChange={(e) => setImportKeysText(e.target.value)} rows={8} placeholder={'XXXXX-YYYYY-ZZZZZ\nUUUUU-VVVVV-WWWWW\n# lignes commençant par # ignorées'} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-y min-h-[120px]" />
              {importKeysText.trim() && <p className="mt-1 text-xs text-slate-400">{parseKeysBulk(importKeysText).length} clé(s) détectée(s)</p>}
              <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); keysFileRef.current?.click(); } }} onClick={() => keysFileRef.current?.click()} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-700">
                <Upload size={16} /> <span>Joindre un fichier .txt ou .csv</span>
                <input ref={keysFileRef} type="file" accept=".txt,.csv,text/plain,text/csv" className="hidden" onChange={handlePickKeysFile} />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
              <button type="button" onClick={onClose} disabled={importBusy} className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50">Annuler</button>
              <button type="submit" disabled={importBusy || (importMode === 'EXISTING' && !importProductId)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-60">
                <span style={{ display: importBusy ? 'inline-flex' : 'none' }}><Loader2 size={18} className="animate-spin" /></span>
                <span style={{ display: importBusy ? 'none' : 'inline-flex' }}><KeySquare size={18} /></span>
                {importBusy ? 'Importation...' : 'Ajouter dans le stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null,
    document.body
  );
}
