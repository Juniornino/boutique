import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EditProductForm } from './edit-product/EditProductForm';

export function EditProductModal({ isOpen, product, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({ name: '', category: '', price: '', promotionalPrice: '', description: '', image: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({ name: product.name || '', category: product.category || '', price: product.price || '', promotionalPrice: product.promotionalPrice || '', description: product.description || '', image: product.image || '' });
      setErrors({});
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom du produit est requis';
    if (!formData.category.trim()) newErrors.category = 'La categorie est requise';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Le prix doit etre superieur a 0';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const submitData = { ...formData, promotionalPrice: formData.promotionalPrice === '' ? null : Number(formData.promotionalPrice) };
    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Modifier le produit</h2>
            <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"><X size={24} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <EditProductForm formData={formData} errors={errors} onChange={handleChange} loading={loading} />
            <div className="flex gap-3 px-6 pb-6 border-t border-slate-200 pt-6">
              <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all disabled:opacity-50">Annuler</button>
              <button type="submit" disabled={loading} className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement...</> : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
