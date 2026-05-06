import React, { useEffect, useState } from 'react';
import { productAPI } from '../services/API';

export function About() {
  const [store, setStore] = useState({ name: '', email: '', phone: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await productAPI.getStoreSettings();
        setStore({
          name: data?.name || 'SoftKeyPro',
          email: data?.email || 'Non renseigné',
          phone: data?.phone || 'Non renseigné',
          description: data?.description || '',
        });
      } catch {
        setStore({
          name: 'SoftKeyPro',
          email: 'Non renseigné',
          phone: 'Non renseigné',
          description: '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">À propos de nous</h1>
        <p className="text-slate-600 mb-8">
          {loading
            ? 'Chargement de la présentation...'
            : (store.description || 'Nous aidons les particuliers et entreprises à acheter des licences logicielles fiables, rapidement et en toute sécurité.')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">Boutique</p>
            <p className="font-bold text-slate-900">{loading ? 'Chargement...' : store.name}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">Email</p>
            <p className="font-semibold text-slate-800 break-all">{loading ? 'Chargement...' : store.email}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">Téléphone</p>
            <p className="font-semibold text-slate-800">{loading ? 'Chargement...' : store.phone}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
