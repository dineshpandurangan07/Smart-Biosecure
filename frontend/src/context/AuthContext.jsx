import React, { createContext, useState, useEffect } from 'react';
import api, { getErrorMessage } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync login credentials from localStorage on boot
  useEffect(() => {
    const localUser = localStorage.getItem('userInfo');
    if (localUser) {
      setUser(JSON.parse(localUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', userData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // Login with Google handler
  const loginWithGoogle = async (googleData) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', googleData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  // Update profile details
  const updateProfile = async (profileData) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

