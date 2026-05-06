import React from 'react';
import { RotateCcw, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '../../components/Badge';

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  if (!Number.isFinite(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function OrdersMobileList({ orders, refundingId, onRefund, deletingId, onDelete }) {
  return (
    <div className="xl:hidden divide-y divide-slate-50">
      {orders.map((order) => (
        <div key={order.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400 mb-0.5">{formatDate(order.createdAt)}</p>
              <p className="font-semibold text-slate-900">{order.user?.email || '-'}</p>
            </div>
            <p className="font-black text-blue-600 text-right text-sm">{Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500 font-semibold mb-1">Produit</p>
              <p className="text-slate-700 font-medium">{order.product?.name || order.productId}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold mb-1">Réf. paiement</p>
              <p className="text-slate-700 font-mono text-[11px] break-all">{order.paymentReference || '-'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Badge status={order.status}>{order.status}</Badge>
            <div className="flex items-center gap-2">
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
          </div>
        </div>
      ))}
    </div>
  );
}
