import React from 'react';
import { Link } from 'react-router-dom';

export function Aides() {
  const whatsappHref = 'https://wa.me/237654900364';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-14 animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">Aides</h1>
      <p className="mt-3 text-slate-600 max-w-2xl">
        Retrouvez ici les informations utiles : activation, dépannage, et assistance. Si besoin, le support répond sur WhatsApp.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Guides d’activation</h2>
          <p className="mt-2 text-sm text-slate-600">
            Les étapes sont disponibles dans votre espace client et dans le fichier <span className="font-mono">GUIDE_ACTIVATION.md</span>.
          </p>
          <div className="mt-4 text-sm">
            <Link to="/dashboard" className="font-bold text-blue-600 hover:underline">Ouvrir Mon espace</Link>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Support WhatsApp</h2>
          <p className="mt-2 text-sm text-slate-600">
            Besoin d’aide ? Cliquez pour discuter avec un technicien.
          </p>
          <div className="mt-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-black hover:bg-slate-800 transition-colors"
            >
              Contacter sur WhatsApp
            </a>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Boutique & commandes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Consultez les produits, achetez une clé et suivez vos achats depuis votre compte.
          </p>
          <div className="mt-4 text-sm flex flex-wrap gap-4">
            <Link to="/shop" className="font-bold text-blue-600 hover:underline">Voir la boutique</Link>
            <Link to="/dashboard" className="font-bold text-blue-600 hover:underline">Mes licences</Link>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-black text-lg">FAQ</h2>
        <div className="mt-4 space-y-3">
          <details className="group rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-black text-slate-900 flex items-center justify-between">
              Je ne vois pas ma clé, que faire ?
              <span className="text-slate-400 group-open:rotate-90 transition-transform">›</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Vérifiez que vous êtes connecté avec le bon email. Ouvrez <Link to="/dashboard" className="font-bold text-blue-600 hover:underline">Mon espace</Link>.
              Si la commande est en attente, patientez quelques instants puis réessayez.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-black text-slate-900 flex items-center justify-between">
              L’activation Windows échoue.
              <span className="text-slate-400 group-open:rotate-90 transition-transform">›</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Assurez-vous que l’édition installée correspond à la licence (Home/Pro). Désactivez VPN/Proxy, puis réessayez.
              Si besoin, contactez WhatsApp.
            </p>
          </details>

          <details className="group rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-black text-slate-900 flex items-center justify-between">
              Office demande une connexion ou une clé différente.
              <span className="text-slate-400 group-open:rotate-90 transition-transform">›</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Vérifiez la version (2019/2021/365) et désinstallez les anciennes versions si conflit.
              Un technicien peut vous guider via WhatsApp.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

