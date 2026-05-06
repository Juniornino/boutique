import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { authAPI } from '../services/API';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      const response = await authAPI.forgotPassword({ email });
      if (response?.data?.resetToken) {
        setMessage(`Token de reset (mode dev): ${response.data.resetToken}`);
      } else if (import.meta.env.DEV) {
        setMessage(
          "Si cet email est enregistre, un lien a ete envoye. En local : sans token affiche ci-dessus, l'email ne correspond a aucun compte (meme orthographe que a l'inscription)."
        );
      } else {
        setMessage('Si cet email existe, un lien de reinitialisation a ete envoye.');
      }
    } catch (err) {
      setError(err.message || 'Erreur pendant la demande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublie"
      subtitle="Saisissez votre email pour recevoir un lien de reinitialisation."
      footer={<p><Link to="/connexion" className="text-blue-600 font-semibold hover:underline">Retour a la connexion</Link></p>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {message ? <p className="text-sm text-emerald-600 break-all">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full py-3">
          {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
        </Button>
      </form>
    </AuthLayout>
  );
}
