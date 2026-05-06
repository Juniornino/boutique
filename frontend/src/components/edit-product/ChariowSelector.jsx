import React from 'react';
import { RefreshCw } from 'lucide-react';

export function ChariowSelector({ value, onChange, chariowProducts, loadingChariow, onRefresh, disabled }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-wider text-slate-600">Produit Chariow lié</label>
        <button type="button" onClick={onRefresh} disabled={loadingChariow || disabled} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50">
          <RefreshCw size={12} className={loadingChariow ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>
      {loadingChariow ? (
        <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-400 text-sm">Chargement des produits Chariow...</div>
      ) : (
        <select name="chariowProductId" value={value} onChange={onChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none transition-all" disabled={disabled}>
          <option value="">— Aucun produit Chariow sélectionné —</option>
          {chariowProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
        </select>
      )}
      {!loadingChariow && chariowProducts.length === 0 && (
        <p className="text-xs text-amber-600 font-medium">Aucun produit trouvé sur Chariow. Vérifiez votre clé API ou créez d'abord un produit sur le dashboard Chariow.</p>
      )}
    </div>
  );
}
