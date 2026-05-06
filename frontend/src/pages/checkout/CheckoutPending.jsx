import React from 'react';
import { Phone, Loader2, ExternalLink } from 'lucide-react';
import { OPERATOR_STYLES, POLL_TIMEOUT_MS } from './checkoutConstants';

export function CheckoutPending({ phoneNumber, operator, statusMessage, countdown, paymentUrl }) {
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const pct = Math.round((countdown / (POLL_TIMEOUT_MS / 1000)) * 100);
  const selectedOp = operator && OPERATOR_STYLES[operator] ? { value: operator, ...OPERATOR_STYLES[operator] } : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Phone size={36} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Finalisez votre paiement</h2>
        <p className="text-slate-500 text-sm mb-6">{statusMessage}</p>

        {paymentUrl && (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mb-6"
          >
            <ExternalLink size={18} />
            Ouvrir la page de paiement
          </a>
        )}

        {selectedOp && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${selectedOp.bg} font-bold text-sm mb-6`}>
            <span>{selectedOp.label}</span>
          </div>
        )}
        {phoneNumber && (
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-slate-500 mb-2">Numéro utilisé</p>
            <p className="font-mono font-bold text-lg text-slate-800">{phoneNumber}</p>
          </div>
        )}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Vérification automatique en cours...</span>
            <span className="font-bold">{mins}:{String(secs).padStart(2, '0')}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Loader2 size={16} className="animate-spin text-blue-500 mt-0.5" />
          <p className="text-sm text-slate-500">Confirmation automatique à la réception du paiement</p>
        </div>
      </div>
    </div>
  );
}
