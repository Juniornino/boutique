import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';

export function ProductKeyRow({ keyData, productId, editingKeyId, editingKeyValue, onEditStart, onEditChange, onEditSave, onEditCancel, onDelete }) {
  const isEditing = editingKeyId === keyData.id;

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
      {isEditing ? (
        <input
          type="text"
          value={editingKeyValue}
          onChange={(e) => onEditChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-sm"
          autoFocus
        />
      ) : (
        <div className="flex items-center justify-between gap-2">
          <code className="block overflow-hidden break-all text-xs font-mono text-slate-700 flex-1">
            {keyData.code || keyData}
          </code>
          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
            keyData.status === 'SOLD'
              ? 'bg-rose-100 text-rose-600'
              : keyData.status === 'RESERVED'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-emerald-100 text-emerald-600'
          }`}>
            {keyData.status === 'SOLD' ? 'Vendue' : keyData.status === 'RESERVED' ? 'Réservée' : 'Disponible'}
          </span>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        {isEditing ? (
          <>
            <button onClick={() => onEditSave(productId, keyData.id)} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors">Valider</button>
            <button onClick={onEditCancel} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Annuler</button>
          </>
        ) : (
          <>
            <button onClick={() => onEditStart(keyData.id, keyData.code || keyData)} className="bg-blue-100 p-2 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors" title="Modifier"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(productId, keyData.id)} className="bg-rose-100 p-2 rounded-lg text-rose-600 hover:bg-rose-200 transition-colors" title="Supprimer"><Trash2 size={14} /></button>
          </>
        )}
      </div>
    </div>
  );
}
