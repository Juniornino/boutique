import React from 'react';

export function StoreSettingsForm({ store, setStore, onSave, loading }) {
  const update = (field) => (e) => setStore((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-lg">Infos boutique</h3>
      <input className="w-full border border-slate-200 rounded-xl p-3" placeholder="Nom boutique" value={store.name} onChange={update('name')} />
      <input className="w-full border border-slate-200 rounded-xl p-3" placeholder="Email boutique" value={store.email} onChange={update('email')} />
      <input className="w-full border border-slate-200 rounded-xl p-3" placeholder="Téléphone boutique" value={store.phone} onChange={update('phone')} />
      <textarea rows="4" className="w-full border border-slate-200 rounded-xl p-3" placeholder="Description de la boutique" value={store.description} onChange={update('description')} />
      <button onClick={onSave} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
        Enregistrer les infos boutique
      </button>
    </div>
  );
}
