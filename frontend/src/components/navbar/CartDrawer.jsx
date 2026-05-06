import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';

export function CartDrawer({ items, cartTotal, updateQuantity, removeItem, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-blue-600" /> Mon Panier
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <ShoppingCart size={48} className="text-slate-300" />
              <p>Votre panier est vide</p>
              <Button onClick={() => { onClose(); navigate('/shop'); }}>Découvrir nos produits</Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                <div className="flex items-center gap-4 w-full">
                  <img src={item.product?.image} alt={item.product?.name} className="w-16 h-16 rounded-xl object-cover bg-white shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{item.product?.name}</h4>
                    <p className="text-blue-600 font-semibold">{Number(item.product?.price || 0).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0 mt-1 sm:mt-0">
                  <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 sm:p-1.5 text-slate-500 hover:text-blue-600">
                      <Minus size={16} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                    <span className="w-8 sm:w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 sm:p-1.5 text-slate-500 hover:text-blue-600">
                      <Plus size={16} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={20} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <span className="text-slate-500 font-medium">Total</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <Button className="w-full py-4 text-lg" onClick={() => { onClose(); navigate('/checkout'); }}>
              Passer la commande
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
