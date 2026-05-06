import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { authAPI, cartAPI } from '../services/API';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      await authAPI.register(form);
      // Le backend crée les cookies JWT — on charge le profil pour mettre à jour AuthContext
      await refreshUser();

      // Si l'utilisateur venait d'un clic "Acheter", on ajoute le produit au panier
      const pendingProductId = location.state?.pendingProductId;
      if (pendingProductId) {
        await cartAPI.addToCart({ productId: pendingProductId, quantity: 1 }).catch(() => {});
      }

      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || "Inscription impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Inscription"
      subtitle="Creez votre compte pour acheter vos licences."
      footer={
        <p>
          Deja inscrit ? <Link className="text-blue-600 font-semibold hover:underline" to="/connexion">Se connecter</Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Prenom"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
            value={form.firstName}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Nom"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
            value={form.lastName}
            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
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
          placeholder="Mot de passe (min 8, 1 majuscule, 1 chiffre)"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Creation...' : 'Creer mon compte'}
        </Button>
      </form>
    </AuthLayout>
  );
}
