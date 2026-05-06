import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { authAPI, cartAPI } from '../services/API';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isExpired = searchParams.get('expired') === '1';
  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await authAPI.login(form);
      await refreshUser();

      // Si l'utilisateur venait d'un clic "Acheter", on ajoute le produit au panier
      const pendingProductId = location.state?.pendingProductId;
      if (pendingProductId) {
        await cartAPI.addToCart({ productId: pendingProductId, quantity: 1 }).catch(() => {});
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Connexion impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Connectez-vous pour acceder a votre espace client."
      footer={
        <p>
          Pas encore de compte ? <Link className="text-blue-600 font-semibold hover:underline" to="/inscription">Creer un compte</Link>
        </p>
      }
    >
      {isExpired && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm font-semibold mb-4">
          Votre session a expiré. Veuillez vous reconnecter.
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
      <div className="mt-4 text-sm">
        <Link to="/mot-de-passe-oublie" className="text-slate-500 hover:text-blue-600 hover:underline">
          Mot de passe oublie ?
        </Link>
      </div>
    </AuthLayout>
  );
}
