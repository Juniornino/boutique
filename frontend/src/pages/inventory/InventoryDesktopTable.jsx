import React from 'react';
import { Link } from 'react-router-dom';
import { Key, Trash2 } from 'lucide-react';

export function InventoryDesktopTable({ products, togglingId, onToggle, onEdit, onDelete, onManageKeys }) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">
          <tr>
            <th className="px-5 py-4">Produit</th>
            <th className="px-5 py-4">Catégorie</th>
            <th className="px-5 py-4 text-right">Prix</th>
            <th className="px-5 py-4 text-right">Stock</th>
            <th className="px-5 py-4 text-center">Actif</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-slate-50/50 transition-colors text-sm">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400 font-bold text-xs">{product.name?.substring(0, 2).toUpperCase()}</div>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
                    {product.promotionalPrice > 0 && <p className="text-xs text-emerald-600 font-semibold">Promo active</p>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-slate-500">{product.category}</td>
              <td className="px-5 py-4 text-right font-bold">{Number(product.price || 0).toLocaleString('fr-FR')} FCFA</td>
              <td className="px-5 py-4 text-right">
                <span className={`font-bold text-sm ${Number(product.availableKeysCount || 0) < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>{product.availableKeysCount ?? 0}</span>
              </td>
              <td className="px-5 py-4 text-center">
                <button onClick={() => onToggle(product._id, product.isActive)} disabled={togglingId === product._id} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${product.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onManageKeys(product._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Gérer les clés"><Key size={16} /></button>
                  <button onClick={() => onEdit(product)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold">Modifier</button>
                  <button onClick={() => onDelete(product._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Supprimer"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
