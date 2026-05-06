import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { authAPI } from '../services/API';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      await authAPI.resetPassword({ token, password });
      setMessage('Mot de passe reinitialise. Redirection vers la connexion...');
      setTimeout(() => navigate('/connexion'), 1000);
    } catch (err) {
      setError(err.message || 'Reinitialisation impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Restaurer le mot de passe"
      subtitle="Entrez votre token et votre nouveau mot de passe."
      footer={<p><Link to="/connexion" className="text-blue-600 font-semibold hover:underline">Retour a la connexion</Link></p>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Token de reinitialisation"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Validation...' : 'Mettre a jour'}
        </Button>
      </form>
    </AuthLayout>
  );
}
