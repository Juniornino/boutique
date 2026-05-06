import React from 'react';

export function MobileMenu({ isAuthenticated, user, goTo, onLogout }) {
  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 animate-in fade-in slide-in-from-top-4">
      <button onClick={() => goTo('/')} className="block w-full text-left font-medium">Accueil</button>
      <button onClick={() => goTo('/shop')} className="block w-full text-left font-medium">Boutique</button>
      <button onClick={() => goTo('/about')} className="block w-full text-left font-medium">À propos</button>
      {user?.role === 'ADMIN' ? (
        <button onClick={() => goTo('/admin')} className="block w-full text-left font-medium text-rose-500">Administration</button>
      ) : null}
      {isAuthenticated ? (
        <>
          <button onClick={() => goTo('/dashboard')} className="block w-full text-left font-medium text-blue-600">Mon Espace</button>
          <button onClick={onLogout} className="block w-full text-left font-medium text-rose-600">Deconnexion</button>
        </>
      ) : (
        <button onClick={() => goTo('/connexion')} className="block w-full text-left font-medium text-blue-600">Connexion</button>
      )}
    </div>
  );
}
