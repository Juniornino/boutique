import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CartDrawer } from './navbar/CartDrawer';
import { MobileMenu } from './navbar/MobileMenu';

export function PublicNavbar({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isCartOpen, setIsCartOpen, cartCount, items, cartTotal, updateQuantity, removeItem } = useCart();

  const goTo = (path) => { navigate(path); setIsMenuOpen(false); };
  const handleLogout = async () => { await onLogout(); setIsMenuOpen(false); };

  const CartButton = ({ className = '' }) => isAuthenticated ? (
    <button onClick={() => setIsCartOpen(true)} className={`relative p-2 text-slate-600 hover:text-blue-600 transition-colors ${className}`}>
      <ShoppingCart size={24} />
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
          {cartCount}
        </span>
      )}
    </button>
  ) : null;

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 p-1.5 rounded-lg"><Zap className="text-white w-6 h-6" /></div>
            <span className="font-bold text-xl tracking-tight text-blue-900">SoftKey<span className="text-blue-600">Pro</span></span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-blue-600' : 'hover:text-blue-600')}>Accueil</NavLink>
            <NavLink to="/shop" className={({ isActive }) => (isActive ? 'text-blue-600' : 'hover:text-blue-600')}>Boutique</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'text-blue-600' : 'hover:text-blue-600')}>À propos</NavLink>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            {user?.role === 'ADMIN' ? <NavLink to="/admin" className="text-rose-500 hover:text-rose-600">Admin</NavLink> : null}
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Mon Espace</NavLink>
                <button onClick={handleLogout} className="text-slate-500 hover:text-rose-600">Deconnexion</button>
              </>
            ) : (
              <NavLink to="/connexion" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">Connexion</NavLink>
            )}
            <CartButton />
          </div>

          <div className="md:hidden flex items-center gap-4">
            <CartButton />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>

        {isMenuOpen ? <MobileMenu isAuthenticated={isAuthenticated} user={user} goTo={goTo} onLogout={handleLogout} /> : null}
      </nav>

      {isCartOpen && (
        <CartDrawer items={items} cartTotal={cartTotal} updateQuantity={updateQuantity} removeItem={removeItem} onClose={() => setIsCartOpen(false)} />
      )}
    </>
  );
}
