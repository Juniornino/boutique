import React, { useMemo } from 'react';
import { Lock, Loader2, CreditCard, ChevronDown } from 'lucide-react';
import { Button } from '../../components/Button';
import { COUNTRIES, OPERATOR_STYLES } from './checkoutConstants';

export function CheckoutPaymentForm({ selectedMethod, setSelectedMethod, country, setCountry, operator, setOperator, phoneNumber, setPhoneNumber, isSubmitting, onSubmit }) {
  const selectedCountry = useMemo(() => COUNTRIES.find((c) => c.code === country) || COUNTRIES[0], [country]);
  const countryOperators = useMemo(() => selectedCountry.operators.map((op) => ({ value: op, ...OPERATOR_STYLES[op] })), [selectedCountry]);

  const handleCountryChange = (code) => {
    setCountry(code);
    const newCountry = COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
    if (!newCountry.operators.includes(operator)) {
      setOperator(newCountry.operators[0] || '');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4">Mode de paiement</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button type="button" onClick={() => setSelectedMethod('mobile_money')} className={`p-3 rounded-xl border-2 text-left transition-all ${selectedMethod === 'mobile_money' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">MOMO</div>
            <span className="font-bold text-sm">Mobile Money</span>
          </div>
          <p className="text-[10px] text-slate-500">MTN • Orange • Wave • Moov...</p>
        </button>
        <button type="button" onClick={() => setSelectedMethod('card')} className={`p-3 rounded-xl border-2 text-left transition-all ${selectedMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className={selectedMethod === 'card' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="font-bold text-sm">Carte Bancaire</span>
          </div>
          <p className="text-[10px] text-slate-500">Visa • Mastercard • Apple Pay</p>
        </button>
      </div>

      {selectedMethod === 'mobile_money' && (
        <>
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Pays</p>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag}  {c.name} ({c.prefix})</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Opérateur</p>
            <div className={`grid gap-3 ${countryOperators.length <= 2 ? 'grid-cols-2' : countryOperators.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {countryOperators.map((op) => (
                <button key={op.value} type="button" onClick={() => setOperator(op.value)} className={`py-2.5 px-3 rounded-xl border-2 font-bold text-sm transition-all ${operator === op.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-700 mb-2">Numéro de téléphone</p>
            <div className="flex">
              <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm font-mono font-semibold select-none">{selectedCountry.prefix}</span>
              <input type="tel" placeholder="6XX XXX XXX" className="flex-1 px-4 py-3 rounded-r-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {selectedMethod === 'card' && (
        <div className="mb-5 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700 mb-1">Paiement sécurisé via Whop</p>
          <p className="text-xs text-slate-500">Vos coordonnées bancaires sont gérées directement par Whop — elles ne transitent pas par nos serveurs.</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Visa', 'Mastercard', 'Apple Pay', 'Google Pay'].map((m) => (
              <span key={m} className="text-[10px] font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-500">{m}</span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button className="w-full py-4 text-lg" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? <span className="flex items-center gap-2 justify-center"><Loader2 size={18} className="animate-spin" /> Initialisation...</span> : 'Confirmer et Payer'}
        </Button>
        <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
          <Lock size={12} />
          {selectedMethod === 'card' ? 'Transactions sécurisées Whop' : 'Transactions sécurisées SendavaPay'}
        </p>
      </div>
    </div>
  );
}
