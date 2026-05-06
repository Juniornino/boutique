import React, { useEffect, useState } from 'react';
import { KeySquare } from 'lucide-react';
import { adminAPI, productAPI } from '../services/API';
import { parseKeysBulk, DEFAULT_DESCRIPTION } from './license-keys/parseKeysBulk';
import { ProductKeysList } from './license-keys/ProductKeysList';
import { ImportKeysModal } from './license-keys/ImportKeysModal';

export function AdminLicenseKeys({
  refreshKey, initialSelectedProductId,
  importModalOpen, onImportModalClose, onRequestOpenImport, onKeysImported,
}) {
  const [products, setProducts]               = useState([]);
  const [message, setMessage]                 = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [productKeys, setProductKeys]         = useState({});
  const [editingKeyId, setEditingKeyId]       = useState(null);
  const [editingKeyValue, setEditingKeyValue] = useState('');

  const [importMode, setImportMode]           = useState('EXISTING');
  const [importProductId, setImportProductId] = useState('');
  const [newProductName, setNewProductName]               = useState('');
  const [newProductCategory, setNewProductCategory]       = useState('OS');
  const [newProductPrice, setNewProductPrice]             = useState('');
  const [newProductPromotionalPrice, setNewProductPromotionalPrice] = useState('');
  const [newProductDescription, setNewProductDescription] = useState(DEFAULT_DESCRIPTION);
  const [importKeysText, setImportKeysText]   = useState('');
  const [importImageFile, setImportImageFile] = useState(null);
  const [importImagePreview, setImportImagePreview] = useState('');
  const [importBusy, setImportBusy]           = useState(false);

  const fetchProductKeys = async (productId) => {
    try { const d = await adminAPI.getProductKeys(productId); setProductKeys((p) => ({ ...p, [productId]: d || [] })); }
    catch { setProductKeys((p) => ({ ...p, [productId]: [] })); }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await productAPI.getProducts({ limit: 100 });
        setProducts(data);
        if (!data.length) return;
        const pref = initialSelectedProductId && data.some((p) => p._id === initialSelectedProductId) ? initialSelectedProductId : data[0]._id;
        setExpandedProduct((prev) => {
          const target = prev && data.some((p) => p._id === prev) ? prev : pref;
          if (target) fetchProductKeys(target);
          return target || prev;
        });
      } catch { setProducts([]); }
    })();
  }, [refreshKey, initialSelectedProductId]);

  useEffect(() => {
    if (!importModalOpen) return;
    if (products.length > 0) { setImportMode('EXISTING'); setImportProductId(initialSelectedProductId && products.some((p) => p._id === initialSelectedProductId) ? initialSelectedProductId : products[0]._id); }
    else { setImportMode('NEW'); setImportProductId(''); }
  }, [importModalOpen]);

  useEffect(() => () => { if (importImagePreview.startsWith('blob:')) URL.revokeObjectURL(importImagePreview); }, [importImagePreview]);

  const handleExpandProduct = (id) => { if (expandedProduct === id) setExpandedProduct(null); else { setExpandedProduct(id); if (!productKeys[id]) fetchProductKeys(id); } };
  const handleDeleteKey = async (pid, kid) => { try { await adminAPI.deleteKey(pid, kid); fetchProductKeys(pid); setMessage('ClÃ© supprimÃ©e avec succÃ¨s'); } catch { setMessage('Erreur lors de la suppression'); } };
  const handleUpdateKey = async (pid, kid) => { if (!editingKeyValue.trim()) return; try { await adminAPI.updateKey(pid, kid, editingKeyValue); setEditingKeyId(null); setEditingKeyValue(''); fetchProductKeys(pid); setMessage('ClÃ© modifiÃ©e avec succÃ¨s'); } catch { setMessage('Erreur lors de la modification'); } };

  const resetImportForm = () => { setImportMode('EXISTING'); setImportKeysText(''); setImportProductId(''); setNewProductName(''); setNewProductCategory('OS'); setNewProductPrice(''); setNewProductPromotionalPrice(''); setNewProductDescription(DEFAULT_DESCRIPTION); setImportImageFile(null); if (importImagePreview.startsWith('blob:')) URL.revokeObjectURL(importImagePreview); setImportImagePreview(''); };
  const closeImportModal = () => { resetImportForm(); onImportModalClose?.(); };
  const handlePickImage = (e) => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith('image/')) { setMessage('Veuillez choisir un fichier image.'); return; } setImportImageFile(f); if (importImagePreview.startsWith('blob:')) URL.revokeObjectURL(importImagePreview); setImportImagePreview(URL.createObjectURL(f)); };

  const handleSubmitImport = async (e) => {
    e.preventDefault();
    const keys = parseKeysBulk(importKeysText);
    if (!keys.length) { setMessage('Ajoutez au moins une clÃ© valide (texte ou fichier).'); return; }
    setImportBusy(true); setMessage('');
    let succeeded = false, targetProductId = importProductId;
    try {
      if (importMode === 'NEW') {
        if (!newProductName.trim() || !newProductPrice || !newProductDescription.trim()) throw new Error('Veuillez remplir tous les champs obligatoires du nouveau produit.');
        if (!importImageFile) throw new Error("L'image du produit est obligatoire lors d'une nouvelle crÃ©ation.");
        const pp = { name: newProductName, category: newProductCategory, price: Number(newProductPrice), description: newProductDescription };
        if (newProductPromotionalPrice && Number(newProductPromotionalPrice) > 0) pp.promotionalPrice = Number(newProductPromotionalPrice);
        targetProductId = (await adminAPI.createProduct(pp))._id;
      } else if (!targetProductId) throw new Error('Veuillez sÃ©lectionner un produit existant.');
      if (importImageFile) await adminAPI.uploadProductImage(targetProductId, importImageFile);
      const bulk = await adminAPI.bulkImportKeys(targetProductId, keys.join('\n'));
      setMessage(typeof bulk?.message === 'string' ? bulk.message : `${keys.length} clÃ©(s) importÃ©e(s).`);
      setExpandedProduct(targetProductId); await fetchProductKeys(targetProductId); succeeded = true;
    } catch (err) { setMessage(err?.message || "Erreur lors de l'import."); }
    finally { setImportBusy(false); }
    if (succeeded) { onKeysImported?.(); resetImportForm(); onImportModalClose?.(); }
  };

  return (
    <div className="w-full overflow-x-hidden box-border space-y-6">
      <div className="min-h-[20px]">{message && <p className="text-sm text-slate-500 px-1">{message}</p>}</div>
      <div className="w-full overflow-x-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-lg">Gestion des clÃ©s de licence</h3>
            <p className="text-sm text-slate-500 mt-0.5">RÃ©approvisionnez un produit existant ou crÃ©ez-en un nouveau avec ses clÃ©s.</p>
          </div>
          <button type="button" onClick={() => onRequestOpenImport?.()} className="shrink-0 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/15 transition-colors">
            <KeySquare size={18} /> Ajouter des clÃ©s
          </button>
        </div>
        <ProductKeysList
          products={products} productKeys={productKeys} expandedProduct={expandedProduct}
          editingKeyId={editingKeyId} editingKeyValue={editingKeyValue}
          onExpandProduct={handleExpandProduct}
          onEditStart={(id, code) => { setEditingKeyId(id); setEditingKeyValue(code); }}
          onEditChange={setEditingKeyValue}
          onEditSave={handleUpdateKey} onEditCancel={() => { setEditingKeyId(null); setEditingKeyValue(''); }}
          onDeleteKey={handleDeleteKey}
          onRequestOpenImport={(pid) => { setImportMode('EXISTING'); setImportProductId(pid); onRequestOpenImport?.(); }}
        />
      </div>
      <ImportKeysModal
        isOpen={importModalOpen} importBusy={importBusy} onClose={closeImportModal} onSubmit={handleSubmitImport}
        importMode={importMode} setImportMode={setImportMode}
        importProductId={importProductId} setImportProductId={setImportProductId}
        products={products} productKeys={productKeys}
        importKeysText={importKeysText} setImportKeysText={setImportKeysText}
        importImageFile={importImageFile} importImagePreview={importImagePreview} onPickImage={handlePickImage}
        newProductName={newProductName} setNewProductName={setNewProductName}
        newProductCategory={newProductCategory} setNewProductCategory={setNewProductCategory}
        newProductPrice={newProductPrice} setNewProductPrice={setNewProductPrice}
        newProductPromotionalPrice={newProductPromotionalPrice} setNewProductPromotionalPrice={setNewProductPromotionalPrice}
        newProductDescription={newProductDescription} setNewProductDescription={setNewProductDescription}
      />
    </div>
  );
}
