import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AdminApp from './admin.jsx';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ProductDetails } from './pages/ProductDetails';
import { OrderSuccess } from './pages/OrderSuccess';
import { About } from './pages/About';
import { Produits } from './pages/Produits';
import { Aides } from './pages/Aides';
import { Juridique } from './pages/Juridique';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { authAPI } from './services/API';

const AUTH_ROUTES = [
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/restaurer-mot-de-passe',
];

export default function AppContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { addToCart } = useCart();

  const handleBuy = async (product) => {
    if (!isAuthenticated) {
      navigate('/inscription', {
        state: { from: { pathname: '/checkout' }, pendingProductId: product._id },
      });
      return;
    }
    try {
      await addToCart(product._id, 1);
      navigate('/checkout');
    } catch (error) {
      window.alert(error.message || 'Ajout au panier impossible.');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      logout();
      navigate('/connexion');
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = AUTH_ROUTES.some((route) => location.pathname.startsWith(route));
  const showPublicLayout = !isAdminRoute && !isAuthRoute;

  return (
    /*
     * max-w-full + overflow-x-hidden ici bloquent tout débordement horizontal
     * quelle que soit la page rendue en dessous.
     */
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F9FAFB] text-slate-900 font-sans">
      {showPublicLayout && (
        <PublicNavbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
      )}
      <main role="main" className={showPublicLayout ? 'pt-24 pb-12' : ''}>
        <Routes>
          <Route path="/" element={<Home handleBuy={handleBuy} />} />
          <Route path="/shop" element={<Shop handleBuy={handleBuy} />} />
          <Route path="/about" element={<About />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/aides" element={<Aides />} />
          <Route path="/juridique" element={<Juridique />} />
          <Route path="/product/:id" element={<ProductDetails handleBuy={handleBuy} />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/restaurer-mot-de-passe/:token?" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin/*" element={<AdminApp />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showPublicLayout && <PublicFooter />}
    </div>
  );
}