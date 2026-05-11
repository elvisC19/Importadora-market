import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to restore session:', error);
        authService.logout();
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (email, password) => {
    await authService.login(email, password);
    const userData = await authService.getCurrentUser();
    setUser(userData);
  };

  const register = async (nombre, email, password, telefono) => {
    await authService.register(nombre, email, password, telefono);
    // Optionally login automatically after registration
    // For now we just follow the request
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
