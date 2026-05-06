import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-600 p-1 rounded-md">
                <Zap className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight">SoftKeyPro</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Leader de la distribution de licences numeriques authentiques. Livraison garantie et support expert.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-4">Produits</h5>
            <ul className="text-sm text-slate-500 space-y-2">
              <li><Link to="/produits" className="hover:text-blue-600">Voir tous les produits</Link></li>
              <li><Link to="/shop" className="hover:text-blue-600">Boutique</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">Aide</h5>
            <ul className="text-sm text-slate-500 space-y-2">
              <li><Link to="/aides" className="hover:text-blue-600">Centre d'aide</Link></li>
              <li><Link to="/aides" className="hover:text-blue-600">Guides d'activation</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">Legal</h5>
            <ul className="text-sm text-slate-500 space-y-2">
              <li><Link to="/juridique" className="hover:text-blue-600">Mentions legales</Link></li>
              <li><Link to="/juridique" className="hover:text-blue-600">CGV</Link></li>
              <li><Link to="/juridique" className="hover:text-blue-600">Confidentialite</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© 2024 SoftKeyPro. Tous droits reserves.</p>
          <div className="flex gap-4">
            <div className="w-8 h-5 bg-slate-100 rounded"></div>
            <div className="w-8 h-5 bg-slate-100 rounded"></div>
            <div className="w-8 h-5 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
