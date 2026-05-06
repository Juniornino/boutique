import React from 'react';

export function ProfileSettingsForm({ profile, setProfile, newPassword, setNewPassword, onSave, loading }) {
  const update = (field) => (e) => setProfile((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-lg">Profil administrateur</h3>
      <input className="w-full border border-slate-200 rounded-xl p-3" value={profile.firstName} onChange={update('firstName')} />
      <input className="w-full border border-slate-200 rounded-xl p-3" value={profile.lastName} onChange={update('lastName')} />
      <input className="w-full border border-slate-200 rounded-xl p-3" value={profile.email} onChange={update('email')} />
      <input
        type="password"
        className="w-full border border-slate-200 rounded-xl p-3"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={onSave} disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-slate-700 disabled:opacity-50">
        Mettre à jour nom, prénom, email et mot de passe
      </button>
    </div>
  );
}
