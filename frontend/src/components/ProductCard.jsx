import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Monitor, FileText, ShieldCheck, Wrench, Package } from 'lucide-react';
import { Badge } from './Badge';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'OS': return <Monitor className="w-8 h-8 text-blue-600" />;
    case 'OFFICE': return <FileText className="w-8 h-8 text-orange-600" />;
    case 'SECURITY': return <ShieldCheck className="w-8 h-8 text-emerald-600" />;
    case 'UTILITY': return <Wrench className="w-8 h-8 text-slate-600" />;
    default: return <Package className="w-8 h-8 text-indigo-600" />;
  }
};

export function ProductCard({ product, onBuy }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          {product.availableKeysCount > 0 ? (
            <Badge color="green">En Stock</Badge>
          ) : (
            <Badge color="red">Rupture</Badge>
          )}
        </div>
        <div className="absolute -bottom-6 left-6 p-3 bg-white rounded-2xl shadow-md border border-slate-100">
          {getCategoryIcon(product.category)}
        </div>
      </div>
      
      <div className="p-6 pt-10 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
          <div>
            {product.promotionalPrice && product.promotionalPrice > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-rose-500 line-through decoration-2 decoration-rose-500 opacity-70">
                  {product.price.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-2xl font-black text-blue-600">{product.promotionalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            ) : (
              <span className="text-2xl font-black text-blue-600">{product.price.toLocaleString('fr-FR')} FCFA</span>
            )}
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prix final</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.availableKeysCount > 0) onBuy();
            }}
            disabled={product.availableKeysCount === 0}
            className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-blue-600 transition-all hover:rotate-3 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:rotate-0"
          >
            <ShoppingCart size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}