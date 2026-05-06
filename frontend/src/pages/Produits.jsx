import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export function Produits() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-14 animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">Produits</h1>
      <p className="mt-3 text-slate-600 max-w-2xl">
        Licences numériques livrées rapidement. Accédez à la boutique pour voir les produits disponibles, les prix et le stock en temps réel.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Windows</h2>
          <p className="mt-2 text-sm text-slate-600">
            Activation simple depuis les paramètres. Guide d’activation disponible dans l’espace client.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Clé numérique</span>
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Support WhatsApp</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Microsoft Office</h2>
          <p className="mt-2 text-sm text-slate-600">
            Activez Office (Word/Excel) en quelques étapes. Dépannage inclus dans la page Aides.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Activation rapide</span>
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Livraison digitale</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Antivirus</h2>
          <p className="mt-2 text-sm text-slate-600">
            Protégez vos appareils. Installation + activation guidées.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Protection</span>
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Assistance</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Serveurs & outils pro</h2>
          <p className="mt-2 text-sm text-slate-600">
            Pour entreprises et IT. Vérifiez la compatibilité avant achat.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Pro</span>
            <span className="text-[11px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">Conseils</span>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-7 md:p-8">
        <h3 className="text-xl md:text-2xl font-black">Comment ça marche ?</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-200">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="font-black text-white">1) Achetez</p>
            <p className="mt-1">Choisissez votre produit dans la boutique.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="font-black text-white">2) Recevez</p>
            <p className="mt-1">Votre clé s’affiche dans <span className="font-bold">Mon espace</span>.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="font-black text-white">3) Activez</p>
            <p className="mt-1">Suivez le guide et contactez WhatsApp si besoin.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate('/shop')}>Aller à la boutique</Button>
          <Button variant="secondary" onClick={() => navigate('/aides')}>Voir les aides</Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Mon espace</Button>
        </div>
      </div>
    </div>
  );
}

