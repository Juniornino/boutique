import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { adminAPI, authAPI } from './services/API';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminPageContent } from './components/AdminPageContent';

export default function AdminApp() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifSummary, setNotifSummary] = useState({ count: 0 });
  const [selectedKeysProductId, setSelectedKeysProductId] = useState('');
  const [keysImportModalOpen, setKeysImportModalOpen] = useState(false);
  const [pendingOpenKeysImport, setPendingOpenKeysImport] = useState(false);

  const handleLogout = async () => {
    try { await authAPI.logout(); } finally { logout(); navigate('/connexion'); }
  };

  useEffect(() => {
    const loadNotif = async () => {
      try {
        const data = await adminAPI.getNotificationsSummary();
        setNotifSummary(data || { count: 0 });
      } catch { setNotifSummary({ count: 0 }); }
    };
    loadNotif();
  }, [refreshKey]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try { setRefreshKey((k) => k + 1); } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleOpenKeys = (productId = '', options = {}) => {
    setSelectedKeysProductId(productId || '');
    setActiveTab('keys');
    if (options.openImport) setPendingOpenKeysImport(true);
  };

  useEffect(() => {
    if (activeTab === 'keys' && pendingOpenKeysImport) {
      setKeysImportModalOpen(true);
      setPendingOpenKeysImport(false);
    }
  }, [activeTab, pendingOpenKeysImport]);

  useEffect(() => {
    if (activeTab !== 'keys') { setKeysImportModalOpen(false); setPendingOpenKeysImport(false); }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AdminSidebar
        isOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <main className={`flex-1 transition-all duration-300 ml-0 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <AdminHeader
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleOpenKeys={handleOpenKeys}
          selectedKeysProductId={selectedKeysProductId}
          notifSummary={notifSummary}
        />
        <AdminPageContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          refreshKey={refreshKey}
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
          handleOpenKeys={handleOpenKeys}
          selectedKeysProductId={selectedKeysProductId}
          keysImportModalOpen={keysImportModalOpen}
          setKeysImportModalOpen={setKeysImportModalOpen}
          setRefreshKey={setRefreshKey}
        />
      </main>
    </div>
  );
}
