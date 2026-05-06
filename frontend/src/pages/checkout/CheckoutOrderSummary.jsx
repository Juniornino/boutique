import React from 'react';
import { ShoppingCart } from 'lucide-react';

export function CheckoutOrderSummary({ items, summary, error }) {
  return (
    <div className="p-6 md:p-8 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart size={20} className="text-blue-600" /> Récapitulatif
      </h3>
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
              <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-bold">{item.product?.name}</h4>
              <p className="text-sm text-slate-500">{item.product?.category} x {item.quantity}</p>
            </div>
            <div className="ml-auto font-bold text-blue-600 whitespace-nowrap">
              {(Number(item.product?.price || 0) * Number(item.quantity || 0)).toLocaleString('fr-FR')} FCFA
            </div>
          </div>
        ))}
      </div>
      {error ? <p className="text-sm text-rose-600 mb-4">{error}</p> : null}
      <div className="space-y-3 text-sm border-t border-slate-200 pt-6">
        <div className="flex justify-between">
          <span className="text-slate-500">Sous-total</span>
          <span>{summary.subtotal.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">TVA (0%)</span>
          <span>0 FCFA</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3 mt-3">
          <span>Total</span>
          <span className="text-blue-600">{summary.total.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>
    </div>
  );
}
