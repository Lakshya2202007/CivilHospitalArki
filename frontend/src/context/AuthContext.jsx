import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // `loading` covers the initial token check, so guards don't redirect too early.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (!cancelled) setAdmin(res.admin);
      } catch {
        // Token was rejected; client.js has already cleared it.
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    tokenStore.set(res.token);
    setAdmin(res.admin);
    return res.admin;
  };

  const logout = () => {
    tokenStore.clear();
    setAdmin(null);
  };

  const value = useMemo(
    () => ({ admin, loading, login, logout, isAuthenticated: Boolean(admin) }),
    [admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider.');
  return ctx;
}
