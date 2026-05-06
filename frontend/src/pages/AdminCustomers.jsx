import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/API';

export function AdminCustomers({ refreshKey }) {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await adminAPI.getCustomersPaginated({ page, limit: 10 });
        setCustomers(response?.data || []);
        setPagination(response?.pagination || { page: 0, limit: 10, total: 0, totalPages: 1 });
      } catch {
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, [refreshKey, page]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-w-full">
      <div className="p-4 md:p-6 border-b border-slate-100">
        <h3 className="font-bold text-lg">Clients</h3>
        <p className="text-sm text-slate-500">Liste des clients et historique d'achat agrégé.</p>
      </div>
      
      {/* Version Desktop */}
      <div className="hidden xl:block divide-y divide-slate-100">
        {customers.map((customer) => (
          <div key={customer.id} className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">{customer.name}</p>
              <p className="text-sm text-slate-500">{customer.email}</p>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-semibold">{customer.orders}</span> commandes
            </div>
            <div className="font-black text-blue-600">{customer.total.toLocaleString('fr-FR')} FCFA</div>
          </div>
        ))}
      </div>

      {/* Version Mobile */}
      <div className="xl:hidden divide-y divide-slate-100 overflow-x-hidden">
        {customers.map((customer) => (
          <div key={customer.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{customer.name}</p>
                <p className="text-xs text-slate-500 truncate">{customer.email}</p>
              </div>
              <p className="font-black text-blue-600 text-right text-sm whitespace-nowrap">
                {customer.total.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Commandes</span>
              <span className="font-semibold text-slate-700">{customer.orders}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50/70 overflow-x-hidden">
        <p className="text-xs text-slate-500 font-semibold">{pagination.total} client(s)</p>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="text-xs font-bold text-slate-600 min-w-0 text-center">
            Page {pagination.page + 1}/{Math.max(1, pagination.totalPages)}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(Math.max(0, pagination.totalPages - 1), p + 1))}
            disabled={page >= Math.max(0, pagination.totalPages - 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
