// AuthContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authAPI } from '../services/API';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CORRECTION 1 : useCallback pour stabiliser refreshUser
  // Sans ça, chaque render recrée la fonction → boucle infinie si utilisée
  // dans un useEffect([refreshUser]) dans un composant enfant
  const refreshUser = useCallback(async () => {
    try {
      // ✅ CORRECTION 2 : bug critique — [authAPI.me](http://...) était
      // un lien Markdown accidentel, pas un appel de fonction valide
      const profile = await authAPI.me();
      setUser(profile ?? null);
      return profile ?? null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []); // aucune dépendance — authAPI est stable (import statique)

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ✅ CORRECTION 3 : on n'expose plus setUser directement
  // Les composants passent par logout() ou refreshUser() — jamais par setUser
  // directement, ce qui évite les mutations non contrôlées de l'état auth
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshUser,
      logout, // ✅ logout centralisé ici, pas dans App.jsx
    }),
    [user, isLoading, refreshUser, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider.');
  }
  return context;
}