import React from 'react';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  Key,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { NavItem } from './AdminComponents';

const navLinks = [
  { key: 'overview', label: "Vue d'ensemble", icon: <TrendingUp size={20} /> },
  { key: 'inventory', label: 'Inventaire', icon: <Package size={20} /> },
  { key: 'orders', label: 'Commandes', icon: <ShoppingCart size={20} /> },
  { key: 'customers', label: 'Clients', icon: <Users size={20} /> },
  { key: 'keys', label: 'Clés licence', icon: <Key size={20} /> },
];

export function AdminSidebar({ isOpen, setSidebarOpen, activeTab, setActiveTab, onLogout }) {
  const handleNavClick = (key) => {
    setActiveTab(key);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/*
       * La sidebar est en position fixed donc elle est hors du flux normal
       * et ne provoque PAS de scroll horizontal par elle-même.
       * On ajoute overflow-x-hidden + max-w-[100vw] pour s'assurer
       * qu'aucun enfant ne déborde vers la droite.
       */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-[#0F172A] text-slate-400 shadow-2xl
          flex flex-col
          overflow-x-hidden
          transition-all duration-300
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 shrink-0">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20 shrink-0">
            <LayoutDashboard size={22} />
          </div>
          {isOpen && (
            <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">
              SoftKey<span className="text-blue-500">Admin</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto overflow-x-hidden">
          {navLinks.map((item) => (
            <NavItem
              key={item.key}
              active={activeTab === item.key}
              icon={item.icon}
              label={item.label}
              collapsed={!isOpen}
              onClick={() => handleNavClick(item.key)}
            />
          ))}

          <div className="pt-4 pb-1 border-t border-slate-800 mt-4">
            {isOpen && (
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 text-slate-500 whitespace-nowrap">
                Configuration
              </span>
            )}
          </div>

          <NavItem
            active={activeTab === 'settings'}
            icon={<Settings size={20} />}
            label="Paramètres"
            collapsed={!isOpen}
            onClick={() => handleNavClick('settings')}
          />
        </nav>

        {/* Déconnexion */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
          >
            <div className="shrink-0">
              <LogOut size={20} />
            </div>
            {isOpen && <span className="font-medium whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}