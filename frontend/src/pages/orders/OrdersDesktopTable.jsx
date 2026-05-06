import React from 'react';
import { RotateCcw, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '../../components/Badge';

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  if (!Number.isFinite(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function OrdersDesktopTable({ orders, refundingId, onRefund, deletingId, onDelete }) {
  return (
    <div className="hidden xl:block overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left">
        <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">
          <tr>
            <th className="px-5 py-4 whitespace-nowrap">Date</th>
            <th className="px-5 py-4 whitespace-nowrap">Client</th>
            <th className="px-5 py-4 whitespace-nowrap">Produit</th>
            <th className="px-5 py-4 whitespace-nowrap">Réf. paiement</th>
            <th className="px-5 py-4 whitespace-nowrap">Statut</th>
            <th className="px-5 py-4 text-right whitespace-nowrap">Montant</th>
            <th className="px-5 py-4 text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
              <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">{formatDate(order.createdAt)}</td>
              <td className="px-5 py-4 font-semibold whitespace-nowrap">{order.user?.email || '-'}</td>
              <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{order.product?.name || order.productId}</td>
              <td className="px-5 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">{order.paymentReference || '-'}</td>
              <td className="px-5 py-4 whitespace-nowrap"><Badge status={order.status}>{order.status}</Badge></td>
              <td className="px-5 py-4 text-right font-black text-slate-900 whitespace-nowrap">{Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA</td>
              <td className="px-5 py-4 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-2 justify-end">
                  {order.status === 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => onRefund(order.id)}
                      disabled={refundingId === order.id || deletingId === order.id}
                      className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors disabled:opacity-50"
                    >
                      {refundingId === order.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Rembourser
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete?.(order.id)}
                    disabled={deletingId === order.id || refundingId === order.id}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {deletingId === order.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
