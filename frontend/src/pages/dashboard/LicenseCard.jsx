import React from 'react';
import { Monitor, FileText, Lock, EyeOff, Eye, Copy, ExternalLink } from 'lucide-react';
import { Badge } from '../../components/Badge';

export function LicenseCard({ order, showKeyId, setShowKeyId, copyFeedback, onCopy }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
      <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
        <div className="flex gap-4">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 h-fit">
            {(order.product?.name || '').includes('Windows') ? <Monitor className="text-blue-600" /> : <FileText className="text-orange-600" />}
          </div>
          <div>
            <h4 className="font-bold text-lg">{order.product?.name || order.productId}</h4>
            <p className="text-xs text-slate-400 font-medium">Commande {order.id}</p>
          </div>
        </div>
        <Badge status={order.status}>{order.status}</Badge>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
          <Lock size={16} className="text-slate-400 shrink-0" />
          <code className="font-mono font-bold tracking-wider text-slate-700 text-xs sm:text-sm whitespace-nowrap">
            {showKeyId === order.id ? (order.licenseKey || 'En attente...') : '•••••-•••••-•••••-•••••-•••••'}
          </code>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setShowKeyId(showKeyId === order.id ? null : order.id)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600" title="Afficher la clé">
            {showKeyId === order.id ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600 relative" title={copyFeedback === order.id ? 'Copié !' : 'Copier la clé'} onClick={() => onCopy(order.id, order.licenseKey)} disabled={!order.licenseKey}>
            <Copy size={18} />
            {copyFeedback === order.id && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">Copié !</span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><ExternalLink size={14} /> Guide d'activation</button>
        <button className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:underline">Télécharger le logiciel</button>
      </div>
    </div>
  );
}
