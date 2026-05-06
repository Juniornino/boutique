import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Monitor, FileText, ShieldCheck, Lock, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProductCard } from '../components/ProductCard';
import { productAPI } from '../services/API';

export function Home({ handleBuy }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getProducts({ limit: 6 });
        setProducts(data);
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 text-center">
        <Badge color="blue">Revendeur Certifié Microsoft</Badge>
        <h1 className="mt-6 text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
          Activez vos logiciels <br className="hidden sm:block" />
          <span className="text-blue-600">en moins de 60 secondes.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-2 sm:px-0">
          Des clés de licence 100% authentiques pour Windows, Office et vos Antivirus préférés. Livraison instantanée par email et support 24/7.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="w-full sm:w-auto h-12 px-8 text-lg" onClick={() => navigate('/shop')}>
            Explorer le catalogue <ArrowRight size={20} />
          </Button>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl">15k+</span>
              <span className="text-xs text-slate-500 uppercase font-semibold">Clients</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl">4.9/5</span>
              <span className="text-xs text-slate-500 uppercase font-semibold">Avis</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 grayscale opacity-60">
          <div className="flex items-center gap-2 font-bold italic"><Monitor /> WINDOWS</div>
          <div className="flex items-center gap-2 font-bold italic"><FileText /> OFFICE</div>
          <div className="flex items-center gap-2 font-bold italic"><ShieldCheck /> KASPERSKY</div>
          <div className="flex items-center gap-2 font-bold italic"><Lock /> NORTON</div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold">Meilleures Ventes</h2>
              <p className="text-slate-500 mt-2">Les licences les plus demandées par nos clients.</p>
            </div>
            <button onClick={() => navigate('/shop')} className="text-blue-600 font-semibold flex items-center gap-1 hover:underline">
              Tout voir <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.slice(0, 3).map(product => (
              <ProductCard key={product._id} product={product} onBuy={() => handleBuy(product)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
