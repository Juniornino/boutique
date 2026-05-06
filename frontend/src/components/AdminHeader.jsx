import React from 'react';
import { Plus, Search, Bell, Menu, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminHeader({
  isSidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  handleOpenKeys,
  selectedKeysProductId,
  notifSummary,
}) {
  const navigate = useNavigate();

  return (
    <header className="min-h-20 bg-white border-b border-slate-200 flex items-center justify-between px-3 py-3 md:px-8 sticky top-0 z-30 backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une transaction..."
            className="bg-transparent outline-none text-sm w-64 text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          type="button"
          onClick={() => handleOpenKeys(selectedKeysProductId, { openImport: true })}
          className="bg-blue-600 text-white px-2.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Ajouter des clés</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="bg-white border border-slate-200 px-2.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 hover:bg-slate-50 transition-all active:scale-95"
          title="Retour à l'accueil"
        >
          <House size={16} />
          <span className="hidden sm:inline">Accueil</span>
        </button>
        <div className="relative group cursor-pointer hidden sm:block">
          <Bell size={20} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
          {Number(notifSummary?.count || 0) > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white rounded-full border-2 border-white text-[9px] font-black flex items-center justify-center">
              {Math.min(Number(notifSummary.count || 0), 99)}
            </span>
          ) : null}
        </div>
        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold group-hover:text-blue-600">Admin Central</p>
            <p className="text-[10px] text-slate-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
