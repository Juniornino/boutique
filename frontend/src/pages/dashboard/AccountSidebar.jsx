import React from 'react';
import { User, Smartphone } from 'lucide-react';

export function AccountSidebar({ user, totalSpent, activeLicenses }) {
  const whatsappHref = 'https://wa.me/237654900364';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User size={32} />
          </div>
          <div>
            <h4 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h4>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total dépensé</span>
            <span className="font-bold">{totalSpent.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Licences actives</span>
            <span className="font-bold text-emerald-600">{activeLicenses}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg">
        <h4 className="font-bold mb-2 flex items-center gap-2"><Smartphone size={20} /> Besoin d'aide ?</h4>
        <p className="text-blue-100 text-sm mb-4">Un problème d'activation ? Nos techniciens vous répondent par WhatsApp.</p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="block text-center w-full bg-white text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors"
        >
          Contacter le support
        </a>
      </div>
    </div>
  );
}
