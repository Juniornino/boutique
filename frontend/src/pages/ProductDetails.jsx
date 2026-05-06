import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Monitor, FileText, ShieldCheck, Wrench, Package, CheckCircle } from 'lucide-react';
import { productAPI } from '../services/API';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'OS': return <Monitor className="w-6 h-6 text-blue-600" />;
    case 'OFFICE': return <FileText className="w-6 h-6 text-orange-600" />;
    case 'SECURITY': return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
    case 'UTILITY': return <Wrench className="w-6 h-6 text-slate-600" />;
    default: return <Package className="w-6 h-6 text-indigo-600" />;
  }
};

export function ProductDetails({ handleBuy }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productAPI.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
        <Button onClick={() => navigate('/shop')}>Retour à la boutique</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-12 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="bg-slate-50 p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full max-w-sm h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-12 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 rounded-xl">
                {getCategoryIcon(product.category)}
              </div>
              <Badge color={product.availableKeysCount > 0 ? "green" : "red"}>
                {product.availableKeysCount > 0 ? "En Stock" : "Rupture"}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle size={20} className="text-emerald-500" />
                <span>Licence officielle et garantie à vie</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle size={20} className="text-emerald-500" />
                <span>Livraison instantanée par Email/WhatsApp</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle size={20} className="text-emerald-500" />
                <span>Support technique 7j/7</span>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Prix TTC</p>
                  {product.promotionalPrice && product.promotionalPrice > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-rose-500 line-through decoration-2 decoration-rose-500 opacity-70">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-4xl font-black text-blue-600">{product.promotionalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-black text-blue-600">{product.price.toLocaleString('fr-FR')} FCFA</span>
                  )}
                </div>
              </div>

              <Button 
                className="w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => product.availableKeysCount > 0 && handleBuy(product)}
                disabled={product.availableKeysCount === 0}
              >
                <ShoppingCart size={24} />
                {product.availableKeysCount > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}