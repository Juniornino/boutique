import React from 'react';
import { Key, Trash2 } from 'lucide-react';

export function InventoryMobileList({ products, togglingId, onToggle, onEdit, onDelete, onManageKeys }) {
  return (
    <div className="lg:hidden divide-y divide-slate-50">
      {products.map((product) => (
        <div key={product._id} className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400 font-bold text-xs">{product.name?.substring(0, 2).toUpperCase()}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{product.name}</p>
              <p className="text-xs text-slate-500">{product.category}</p>
            </div>
            <button onClick={() => onToggle(product._id, product.isActive)} disabled={togglingId === product._id} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${product.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500 font-semibold mb-1">Prix</p>
              <p className="font-bold">{Number(product.price || 0).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold mb-1">Stock</p>
              <p className={`font-bold ${Number(product.availableKeysCount || 0) < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>{product.availableKeysCount ?? 0} clés</p>
            </div>
          </div>
          <div className="flex gap-2 pt-1 border-t border-slate-100">
            <button onClick={() => onManageKeys(product._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold"><Key size={13} /> Clés</button>
            <button onClick={() => onEdit(product)} className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold">Modifier</button>
            <button onClick={() => onDelete(product._id)} className="p-2 rounded-lg bg-rose-50 text-rose-600"><Trash2 size={15} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
