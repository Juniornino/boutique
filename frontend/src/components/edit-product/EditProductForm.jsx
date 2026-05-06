import React from 'react';
import { AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'OS', label: "Système d'exploitation (OS)" },
  { value: 'OFFICE', label: 'Bureautique (OFFICE)' },
  { value: 'SECURITY', label: 'Sécurité / Antivirus (SECURITY)' },
  { value: 'UTILITY', label: 'Utilitaire (UTILITY)' },
  { value: 'OTHER', label: 'Autre' },
];

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold"><AlertCircle size={14} />{msg}</div>;
}

export function EditProductForm({ formData, errors, onChange, loading, children }) {
  const cls = (field) => `w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${errors[field] ? 'border-rose-400 bg-rose-50 focus:border-rose-500' : 'border-slate-200 bg-slate-50 focus:border-blue-500'}`;

  return (
    <form className="p-6 space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-slate-600">Nom du produit</label>
        <input type="text" name="name" value={formData.name} onChange={onChange} placeholder="Ex: Windows 11 Pro" className={cls('name')} disabled={loading} />
        <FieldError msg={errors.name} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-600">Catégorie</label>
          <select name="category" value={formData.category} onChange={onChange} className={cls('category')} disabled={loading}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <FieldError msg={errors.category} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-600">Prix (FCFA)</label>
          <input type="number" name="price" value={formData.price} onChange={onChange} placeholder="0" min="0" step="100" className={cls('price')} disabled={loading} />
          <FieldError msg={errors.price} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-slate-600">Prix promotionnel (FCFA) - Optionnel</label>
        <input type="number" name="promotionalPrice" value={formData.promotionalPrice} onChange={onChange} placeholder="Ex: 12000" min="0" step="100" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none transition-all" disabled={loading} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-slate-600">Description</label>
        <textarea name="description" value={formData.description} onChange={onChange} placeholder="Décrivez le produit..." rows="4" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none transition-all resize-none" disabled={loading} />
      </div>

      {children}

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-slate-600">URL de l'image</label>
        <input type="url" name="image" value={formData.image} onChange={onChange} placeholder="https://..." className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none transition-all" disabled={loading} />
        {formData.image && <div className="mt-3 flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200"><img src={formData.image} alt="Aperçu" className="max-h-40 rounded-lg" onError={() => {}} /></div>}
      </div>
    </form>
  );
}
