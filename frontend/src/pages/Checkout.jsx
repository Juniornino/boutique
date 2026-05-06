import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, CreditCard, ExternalLink } from 'lucide-react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { Button } from '../components/Button';
import { cartAPI, productAPI, checkoutAPI } from '../services/API';
import { usePollingStatus } from './checkout/usePollingStatus';
import { CheckoutPending } from './checkout/CheckoutPending';
import { CheckoutOrderSummary } from './checkout/CheckoutOrderSummary';
import { CheckoutPaymentForm } from './checkout/CheckoutPaymentForm';

export function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState('MTN');
  const [country, setCountry] = useState('CM');
  const [selectedMethod, setSelectedMethod] = useState('mobile_money');
  const [whopSession, setWhopSession] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form');
  const [statusMessage, setStatusMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { startPolling, stopPolling } = usePollingStatus({ setPaymentStep, setStatusMessage, setCountdown });

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    (async () => {
      setIsLoading(true); setError('');
      try {
        const cart = await cartAPI.getCart();
        const rows = await Promise.all((cart || []).map(async (e) => ({ ...e, product: await productAPI.getProductById(e.productId) })));
        setItems(rows.filter((r) => r.product));
      } catch (err) { setError(err.message || 'Impossible de charger le panier.'); setItems([]); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const summary = useMemo(() => {
    const subtotal = items.reduce((acc, i) => {
      const p = i.product;
      const unitPrice = (p?.promotionalPrice && Number(p.promotionalPrice) > 0) ? Number(p.promotionalPrice) : Number(p?.price || 0);
      return acc + (unitPrice * Number(i.quantity || 0));
    }, 0);
    return { subtotal, total: subtotal };
  }, [items]);

  const [paymentUrl, setPaymentUrl] = useState('');

  const completeOrder = async () => {
    setError(''); setIsSubmitting(true);
    try {
      const payload = { paymentMethod: selectedMethod, country };
      if (selectedMethod === 'mobile_money' && phoneNumber.trim()) {
        payload.phoneNumber = phoneNumber.replace(/\D/g, '');
        if (operator) payload.operator = operator;
      }
      const response = await checkoutAPI.createSession(payload);
      if (response?.step === 'pending' && response?.reference) {
        setStatusMessage(response.message || 'Finalisez votre paiement via le lien SendavaPay.');
        if (response.paymentUrl) { setPaymentUrl(response.paymentUrl); window.open(response.paymentUrl, '_blank'); }
        setPaymentStep('pending'); startPolling(response.reference); return;
      }
      if (response?.step === 'card' && (response?.sessionId || response?.purchaseUrl)) {
        setWhopSession({ sessionId: response.sessionId, planId: response.planId, purchaseUrl: response.purchaseUrl, amountUSD: response.amountUSD });
        setPaymentStep('card'); return;
      }
      setError('Réponse inattendue du serveur de paiement.');
    } catch (err) { setError(err.message || 'Erreur lors du lancement du paiement.'); }
    finally { setIsSubmitting(false); }
  };

  const handleRetry = () => { stopPolling(); setPaymentStep('form'); setWhopSession(null); setStatusMessage(''); setError(''); };

  if (isLoading) return <div className="max-w-xl mx-auto px-4"><div className="bg-white p-8 rounded-2xl border border-slate-200 text-center"><p className="text-slate-600">Chargement du panier...</p></div></div>;
  if (!items.length) return <div className="max-w-xl mx-auto px-4"><div className="bg-white p-8 rounded-2xl border border-slate-200 text-center"><h2 className="text-2xl font-bold mb-2">Panier vide</h2><p className="text-slate-500 mb-6">Selectionnez un produit avant de passer au paiement.</p><Button onClick={() => navigate('/shop')}>Retour a la boutique</Button></div></div>;

  if (paymentStep === 'card' && whopSession) return (
    <div className="max-w-2xl mx-auto px-4 py-8"><div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3"><CreditCard size={20} className="text-blue-600" /><div><p className="font-bold text-sm">Paiement par Carte Bancaire</p><p className="text-xs text-slate-500">{whopSession.amountUSD} USD ≈ {summary.total.toLocaleString('fr-FR')} FCFA</p></div></div>
        <button onClick={handleRetry} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><RefreshCw size={12} /> Changer</button>
      </div>
      {whopSession.purchaseUrl ? (
        <div className="p-8 text-center">
          <p className="text-slate-500 text-sm mb-6">Cliquez ci-dessous pour finaliser votre paiement sur la page sécurisée Whop.</p>
          <a href={whopSession.purchaseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
            <ExternalLink size={18} /> Payer {whopSession.amountUSD} USD
          </a>
          <p className="text-xs text-slate-400 mt-4">Vous serez redirigé automatiquement après le paiement.</p>
        </div>
      ) : whopSession.sessionId ? (
        <WhopCheckoutEmbed sessionId={whopSession.sessionId} returnUrl={`${window.location.origin}/order-success`} onComplete={() => { setPaymentStep('completed'); setTimeout(() => navigate('/order-success'), 1500); }} />
      ) : null}
    </div></div>
  );

  if (paymentStep === 'pending') return <CheckoutPending phoneNumber={phoneNumber} operator={operator} statusMessage={statusMessage} countdown={countdown} paymentUrl={paymentUrl} />;
  if (paymentStep === 'completed') return <div className="max-w-lg mx-auto px-4 py-12"><div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center"><CheckCircle size={64} className="text-green-500 mx-auto mb-4" /><h2 className="text-2xl font-bold text-green-700 mb-2">Paiement confirmé !</h2><p className="text-slate-500">Votre clé de licence vous est envoyée par email. Redirection...</p></div></div>;
  if (paymentStep === 'failed') return <div className="max-w-lg mx-auto px-4 py-12"><div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center"><XCircle size={64} className="text-rose-500 mx-auto mb-4" /><h2 className="text-2xl font-bold text-rose-700 mb-2">Paiement échoué</h2><p className="text-slate-500 mb-6">{statusMessage}</p><Button onClick={handleRetry} className="flex items-center gap-2 mx-auto"><RefreshCw size={16} /> Réessayer</Button></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <CheckoutOrderSummary items={items} summary={summary} error={error} />
          <CheckoutPaymentForm selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} country={country} setCountry={setCountry} operator={operator} setOperator={setOperator} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} isSubmitting={isSubmitting} onSubmit={completeOrder} />
        </div>
      </div>
    </div>
  );
}
