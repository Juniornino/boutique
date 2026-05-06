import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { productAPI } from '../services/API';

export function Shop({ handleBuy }) {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getProducts({ limit: 100 });
        setProducts(data);
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = selectedCategory === 'Tous'
      ? products
      : products.filter((p) => p.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        `${p.name} ${p.description || ''}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-3xl font-bold">Catalogue complet</h2>
        <p className="text-slate-500 mt-2">Trouvez la licence qu'il vous faut au meilleur prix.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          {['Tous', 'OS', 'OFFICE', 'SECURITY', 'UTILITY', 'OTHER'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {cat === 'Tous' ? 'Tous' : cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un logiciel..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product._id} product={product} onBuy={() => handleBuy(product)} />
        ))}
      </div>
    </div>
  );
}
