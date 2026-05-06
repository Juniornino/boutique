import React, { useEffect, useState } from 'react';
import { adminAPI, authAPI } from '../services/API';
import { StoreSettingsForm } from './settings/StoreSettingsForm';
import { ProfileSettingsForm } from './settings/ProfileSettingsForm';

export function AdminSettings({ refreshKey }) {
  const [store, setStore] = useState({ name: '', email: '', phone: '', description: '' });
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [loadingStore, setLoadingStore] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [me, settings] = await Promise.all([authAPI.me(), adminAPI.getSettings()]);
        setProfile({ firstName: me?.firstName || '', lastName: me?.lastName || '', email: me?.email || '' });
        setStore({ name: settings?.name || '', email: settings?.email || '', phone: settings?.phone || '', description: settings?.description || '' });
      } catch {
        setProfile({ firstName: '', lastName: '', email: '' });
        setStore({ name: '', email: '', phone: '', description: '' });
      }
    };
    fetchData();
  }, [refreshKey]);

  const saveStoreSettings = async () => {
    setLoadingStore(true);
    try {
      const response = await adminAPI.updateSettings(store);
      const d = response?.data || response;
      setStore({ name: d?.name || '', email: d?.email || '', phone: d?.phone || '', description: d?.description || '' });
      setMessage(response?.message || 'Paramètres boutique mis à jour.');
    } catch (error) { setMessage(error.message); }
    finally { setLoadingStore(false); }
  };

  const saveProfile = async () => {
    setLoadingProfile(true);
    try {
      const payload = { firstName: profile.firstName, lastName: profile.lastName, email: profile.email, password: newPassword };
      const response = await adminAPI.updateProfile(payload);
      const d = response?.data || response;
      setProfile({ firstName: d?.firstName || '', lastName: d?.lastName || '', email: d?.email || '' });
      setNewPassword('');
      setMessage(response?.message || 'Profil administrateur mis à jour.');
    } catch (error) { setMessage(error.message); }
    finally { setLoadingProfile(false); }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm font-semibold">{message}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StoreSettingsForm store={store} setStore={setStore} onSave={saveStoreSettings} loading={loadingStore} />
        <ProfileSettingsForm profile={profile} setProfile={setProfile} newPassword={newPassword} setNewPassword={setNewPassword} onSave={saveProfile} loading={loadingProfile} />
      </div>
    </div>
  );
}
