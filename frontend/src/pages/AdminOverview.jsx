import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, AlertTriangle, Users } from 'lucide-react';
import { StatCard } from '../components/AdminComponents';
import { adminAPI, productAPI } from '../services/API';
import { RecentSalesTable } from './overview/RecentSalesTable';
import { ActivityPanel } from './overview/ActivityPanel';

export function AdminOverview({ setActiveTab, refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [orderData, productData, activityData] = await Promise.all([
          adminAPI.getOrders({ limit: 20 }),
          productAPI.getProducts({ limit: 100 }),
          adminAPI.getActivities({ limit: 10 }),
        ]);
        setOrders(orderData);
        setProducts(productData);
        setActivities(activityData);
      } catch {
        setOrders([]);
        setProducts([]);
        setActivities([]);
        setError("Impossible de charger les données admin.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleDeleteOrderFromOverview = async (orderId) => {
    if (!window.confirm('Confirmer la suppression de cette commande ?')) return;
    setDeletingId(orderId);
    try {
      await adminAPI.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      // Recharger un peu d’activité pour rester cohérent (best-effort)
      adminAPI.getActivities({ limit: 10 }).then(setActivities).catch(() => {});
    } catch (e) {
      window.alert(e?.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const revenue = orders.reduce((acc, item) => acc + Number(item.totalAmount || 0), 0);
    const customers = new Set(orders.map((item) => item.user?.email).filter(Boolean)).size;
    const lowStock = products.filter((item) => Number(item.availableKeysCount || 0) < 10).length;
    return { revenue, customers, lowStock };
  }, [orders, products]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Chiffre d'Affaires" value={`${stats.revenue.toLocaleString('fr-FR')} FCFA`} trend="Live" isUp={true} icon={DollarSign} />
        <StatCard label="Commandes" value={`${orders.length}`} trend="Live" isUp={true} icon={ShoppingCart} />
        <StatCard label="Stock Critique" value={`${stats.lowStock}`} trend="Action requise" isUp={false} icon={AlertTriangle} />
        <StatCard label="Clients Actifs" value={`${stats.customers}`} trend="Live" isUp={true} icon={Users} />
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-4 py-3 text-sm font-semibold">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RecentSalesTable orders={orders} setActiveTab={setActiveTab} deletingId={deletingId} onDeleteOrder={handleDeleteOrderFromOverview} />
        <ActivityPanel activities={activities} isLoading={isLoading} onDismiss={(idx) => setActivities((prev) => prev.filter((_, i) => i !== idx))} />
      </div>
    </div>
  );
}
