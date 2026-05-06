import React from 'react';
import { ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '../../components/Badge';

export function RecentSalesTable({ orders, setActiveTab, deletingId, onDeleteOrder }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <ShoppingCart size={18} className="text-blue-600" /> Ventes Récentes
        </h3>
        <button onClick={() => setActiveTab('orders')} className="text-blue-600 text-xs font-bold hover:underline">Voir tout l'historique</button>
      </div>

      {/* Version Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-center whitespace-nowrap">ID</th>
              <th className="px-6 py-4 whitespace-nowrap">Client</th>
              <th className="px-6 py-4 whitespace-nowrap">Produit</th>
              <th className="px-6 py-4 whitespace-nowrap">Méthode</th>
              <th className="px-6 py-4 whitespace-nowrap">Statut</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Montant</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                <td className="px-6 py-4 font-mono font-bold text-slate-400 text-center whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4 font-bold whitespace-nowrap">{order.user?.email || '-'}</td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{order.productId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center gap-2 font-medium text-[11px] text-slate-600">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div> Mobile Money
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge status={order.status}>{order.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-900 whitespace-nowrap">
                  {Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onDeleteOrder?.(order.id)}
                    disabled={deletingId === order.id}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {deletingId === order.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Version Mobile */}
      <div className="md:hidden divide-y divide-slate-50">
        {orders.map(order => (
          <div key={order.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-slate-400 mb-1">{order.id}</p>
                <p className="font-bold text-slate-900">{order.user?.email || '-'}</p>
              </div>
              <p className="font-black text-blue-600 text-right text-sm">
                {Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500 font-semibold mb-1">Produit</p>
                <p className="text-slate-700">{order.productId}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-1">Paiement</p>
                <p className="text-slate-700">Mobile Money</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Statut</span>
              <Badge status={order.status}>{order.status}</Badge>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onDeleteOrder?.(order.id)}
                disabled={deletingId === order.id}
                className="w-full inline-flex justify-center items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {deletingId === order.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
