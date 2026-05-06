import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { ProductKeyRow } from './ProductKeyRow';

export function ProductKeysList({
  products, productKeys, expandedProduct,
  editingKeyId, editingKeyValue,
  onExpandProduct, onEditStart, onEditChange, onEditSave, onEditCancel,
  onDeleteKey, onRequestOpenImport,
}) {
  return (
    <div className="divide-y divide-slate-100">
      {products.length === 0 && (
        <p className="text-center text-slate-400 text-sm py-12">
          Aucun produit — commencez par en créer un via "Ajouter des clés".
        </p>
      )}
      {products.map((product) => (
        <div key={product._id}>
          <div
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpandProduct(product._id); } }}
            onClick={() => onExpandProduct(product._id)}
            className="w-full p-4 md:p-6 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {product.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate text-sm md:text-base">{product.name}</p>
                <p className="text-xs text-slate-500 truncate">{product.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(() => {
                const all = productKeys[product._id] || [];
                const available = all.filter((k) => k.status === 'AVAILABLE').length;
                return (
                  <span
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-semibold text-xs whitespace-nowrap"
                    title={`${available} disponible(s) sur ${all.length} au total`}
                  >
                    {available}/{all.length || 0} clés
                  </span>
                );
              })()}
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedProduct === product._id ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {expandedProduct === product._id && (
            <div className="bg-slate-50 border-t border-slate-100 p-3 md:p-6">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRequestOpenImport(product._id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={13} /> Réapprovisionner
                </button>
              </div>
              {productKeys[product._id]?.length ? (
                <div className="space-y-2">
                  {productKeys[product._id].map((key, idx) => (
                    <ProductKeyRow
                      key={key.id || idx}
                      keyData={key}
                      productId={product._id}
                      editingKeyId={editingKeyId}
                      editingKeyValue={editingKeyValue}
                      onEditStart={onEditStart}
                      onEditChange={onEditChange}
                      onEditSave={onEditSave}
                      onEditCancel={onEditCancel}
                      onDelete={onDeleteKey}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 text-sm py-8">Aucune clé pour ce produit</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
