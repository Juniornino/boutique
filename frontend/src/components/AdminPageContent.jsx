import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AdminOverview } from '../pages/AdminOverview';
import { AdminInventory } from '../pages/AdminInventory';
import { AdminOrders } from '../pages/AdminOrders';
import { AdminCustomers } from '../pages/AdminCustomers';
import { AdminSettings } from '../pages/AdminSettings';
import { AdminLicenseKeys } from '../pages/AdminLicenseKeys';

const TAB_TITLES = {
  overview: 'Tableau de bord',
  inventory: "Gestion de l'inventaire",
  orders: 'Historique des ventes',
  customers: 'Gestion des clients',
  keys: 'Ajout des cles de licence',
  settings: 'Parametres administrateur',
};

export function AdminPageContent({
  activeTab,
  setActiveTab,
  refreshKey,
  isRefreshing,
  handleRefresh,
  handleOpenKeys,
  selectedKeysProductId,
  keysImportModalOpen,
  setKeysImportModalOpen,
  setRefreshKey,
}) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {TAB_TITLES[activeTab] || ''}
          </h1>
          <p className="text-slate-500 text-sm">Gestion centralisee des licences SoftKeyPro.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white border border-slate-200 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} refreshKey={refreshKey} />}
      {activeTab === 'inventory' && <AdminInventory refreshKey={refreshKey} onManageKeys={handleOpenKeys} />}
      {activeTab === 'orders' && <AdminOrders refreshKey={refreshKey} />}
      {activeTab === 'customers' && <AdminCustomers refreshKey={refreshKey} />}
      {activeTab === 'keys' && (
        <AdminLicenseKeys
          refreshKey={refreshKey}
          initialSelectedProductId={selectedKeysProductId}
          importModalOpen={keysImportModalOpen}
          onImportModalClose={() => setKeysImportModalOpen(false)}
          onRequestOpenImport={() => setKeysImportModalOpen(true)}
          onKeysImported={() => setRefreshKey((k) => k + 1)}
        />
      )}
      {activeTab === 'settings' && <AdminSettings refreshKey={refreshKey} />}
    </div>
  );
}
