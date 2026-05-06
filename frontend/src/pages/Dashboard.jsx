import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../services/API';
import { AccountSidebar } from './dashboard/AccountSidebar';
import { LicenseCard } from './dashboard/LicenseCard';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showKeyId, setShowKeyId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderAPI.getMyOrders({ limit: 50 });
        setOrders(data);
      } catch { setOrders([]); }
    };
    fetchOrders();
  }, []);

  const handleCopy = (orderId, keyCode) => {
    if (!keyCode) return;
    navigator.clipboard.writeText(keyCode).then(() => {
      setCopyFeedback(orderId);
      setTimeout(() => setCopyFeedback(null), 2000);
    }).catch(() => {});
  };

  const totalSpent = orders.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  const activeLicenses = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Mon Espace Client</h2>
          <p className="text-slate-500 mt-1">Gérez vos clés et accédez à vos guides d'activation.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/shop')}>Acheter une autre clé</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AccountSidebar user={user} totalSpent={totalSpent} activeLicenses={activeLicenses} />
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-xl mb-4">Mes Licences</h3>
          {orders.map(order => (
            <LicenseCard key={order.id} order={order} showKeyId={showKeyId} setShowKeyId={setShowKeyId} copyFeedback={copyFeedback} onCopy={handleCopy} />
          ))}
        </div>
      </div>
    </div>
  );
}
