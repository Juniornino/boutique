import React, { useEffect, useState } from 'react';
import { EditProductModal } from '../components/EditProductModal';
import { adminAPI } from '../services/API';
import { InventoryDesktopTable } from './inventory/InventoryDesktopTable';
import { InventoryMobileList } from './inventory/InventoryMobileList';

export function AdminInventory({ refreshKey, onManageKeys }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0, totalPages: 1 });
  const [togglingId, setTogglingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getProductsPaginated({ page, limit: 10 });
        setProducts(res?.data || []);
        setPagination(res?.pagination || { page: 0, limit: 10, total: 0, totalPages: 1 });
      } catch { setProducts([]); }
    })();
  }, [refreshKey, page]);

  const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleToggle = async (productId, currentState) => {
    setTogglingId(productId);
    try {
      const nextState = !currentState;
      await adminAPI.updateProduct(productId, { isActive: nextState });
      setProducts((prev) => prev.map((p) => p._id === productId ? { ...p, isActive: nextState } : p));
      flash('Etat du produit mis a jour');
    } catch (err) { flash('Erreur: ' + err.message); }
    finally { setTogglingId(null); }
  };

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      await adminAPI.updateProduct(selectedProduct._id, formData);
      setProducts((prev) => prev.map((p) => p._id === selectedProduct._id ? { ...p, ...formData } : p));
      setModalOpen(false); setSelectedProduct(null); flash('Produit modifie avec succes');
    } catch (err) { flash('Erreur: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    setLoading(true);
    try {
      await adminAPI.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      flash('Produit supprime avec succes');
    } catch (err) { flash('Erreur: ' + err.message); }
    finally { setLoading(false); }
  };

  const sharedProps = {
    products, togglingId,
    onToggle: handleToggle,
    onEdit: (p) => { setSelectedProduct(p); setModalOpen(true); },
    onDelete: handleDelete,
    onManageKeys: (pid) => onManageKeys?.(pid, { openImport: true }),
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden animate-in slide-in-from-right-4 duration-500 space-y-6">
      {message && <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm font-semibold">{message}</div>}
      <div className="w-full max-w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <InventoryDesktopTable {...sharedProps} />
        <InventoryMobileList {...sharedProps} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <p className="text-xs text-slate-500 font-semibold">{pagination.total} produit(s) au total</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40">Precedent</button>
            <span className="text-xs font-bold text-slate-600 min-w-16 text-center">Page {pagination.page + 1}/{Math.max(1, pagination.totalPages)}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(Math.max(0, pagination.totalPages - 1), p + 1))} disabled={page >= Math.max(0, pagination.totalPages - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      </div>
      <EditProductModal isOpen={modalOpen} product={selectedProduct} onClose={() => { setModalOpen(false); setSelectedProduct(null); }} onSave={handleSave} loading={loading} />
    </div>
  );
}
