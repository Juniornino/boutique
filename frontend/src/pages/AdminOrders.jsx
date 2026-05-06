import React, { useCallback, useEffect, useState } from 'react';
import { adminAPI } from '../services/API';
import { OrdersDesktopTable } from './orders/OrdersDesktopTable';
import { OrdersMobileList } from './orders/OrdersMobileList';

export function AdminOrders({ refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [refundingId, setRefundingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const fetchOrders = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getOrdersPaginated(params);
      setOrders(res?.data || []);
      setPagination(res?.pagination || { page: 0, limit: 10, total: 0, totalPages: 1 });
    } catch { setOrders([]); }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [refreshKey, fetchOrders]);

  const handleRefund = async (orderId) => {
    if (!window.confirm('Confirmer le remboursement ?')) return;
    setRefundingId(orderId); setMessage('');
    try {
      const res = await adminAPI.refundOrder(orderId);
      setMessageType('success'); setMessage(res?.message || 'Remboursement effectue.');
      await fetchOrders();
    } catch (err) { setMessageType('error'); setMessage(err?.message || 'Erreur lors du remboursement.'); }
    finally { setRefundingId(null); setTimeout(() => setMessage(''), 5000); }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Confirmer la suppression de cette commande ?')) return;
    setDeletingId(orderId);
    setMessage('');
    try {
      const res = await adminAPI.deleteOrder(orderId);
      setMessageType('success');
      setMessage(res?.message || 'Commande supprimée.');
      await fetchOrders();
    } catch (err) {
      setMessageType('error');
      setMessage(err?.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-4">
      {message && <div className={`px-4 py-3 rounded-lg text-sm font-semibold border ${messageType === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{message}</div>}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold text-lg">Commandes</h3><p className="text-sm text-slate-500">Suivi des commandes et statuts de paiement.</p></div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white w-full sm:w-48">
            <option value="">Tous les statuts</option>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
        <OrdersDesktopTable orders={orders} refundingId={refundingId} onRefund={handleRefund} deletingId={deletingId} onDelete={handleDelete} />
        <OrdersMobileList orders={orders} refundingId={refundingId} onRefund={handleRefund} deletingId={deletingId} onDelete={handleDelete} />
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <p className="text-xs text-slate-500 font-semibold">{pagination.total} commande(s)</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40">Precedent</button>
            <span className="text-xs font-bold text-slate-600 min-w-16 text-center">Page {pagination.page + 1}/{Math.max(1, pagination.totalPages)}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(Math.max(0, pagination.totalPages - 1), p + 1))} disabled={page >= Math.max(0, pagination.totalPages - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
