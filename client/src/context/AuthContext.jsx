import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  // Helper to persist auth state
  const saveAuthSession = (authToken, authUser) => {
    localStorage.setItem('saferoute_token', authToken);
    localStorage.setItem('saferoute_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  // Helper to clear auth state
  const clearAuthSession = () => {
    localStorage.removeItem('saferoute_token');
    localStorage.removeItem('saferoute_user');
    setToken(null);
    setUser(null);
  };

  // Verify and sync authentication state on application boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('saferoute_token');
      const storedUser = localStorage.getItem('saferoute_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Validate token with backend /api/auth/me
          const response = await api.get('/auth/me');
          if (response.data?.success && response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('saferoute_user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          console.warn('[Auth Initialization] Session expired or invalid, logging out.');
          clearAuthSession();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, phone }
   */
  const register = async ({ name, email, password, phone }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
      });

      const { token: receivedToken, user: receivedUser } = response.data;
      saveAuthSession(receivedToken, receivedUser);
      setLoading(false);
      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.message || 'Registration failed. Please check your inputs.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  /**
   * Log in an existing user
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;
      saveAuthSession(receivedToken, receivedUser);
      setLoading(false);
      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.message || 'Invalid email or password.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    clearAuthSession();
    setError(null);
  };

  /**
   * Update user profile information
   * @param {Object} profileData - { name, phone }
   */
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch('/auth/profile', profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('saferoute_user', JSON.stringify(updatedUser));
      setLoading(false);
      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.message || 'Failed to update profile.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    clearError,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume the AuthContext safely
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

