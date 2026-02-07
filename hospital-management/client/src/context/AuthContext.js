import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/gatewayService';

/**
 * Auth Context for Unified Portal
 * Manages authentication with HR system via Gateway
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (on app startup)
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        
        const savedServices = localStorage.getItem('services');
        if (savedServices) {
          setServices(JSON.parse(savedServices));
        }
      } catch (err) {
        console.error('Error restoring auth:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Demo mode - if HR system not available
      if (email === 'demo@example.com' && password === 'demo123') {
        const demoUser = {
          id: '1',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          department: 'Engineering',
          role: 'EMPLOYEE',
          services: ['hr', 'hospital']
        };
        const demoToken = 'demo_token_' + Date.now();

        setToken(demoToken);
        setUser(demoUser);
        setServices(['hr', 'hospital']);

        localStorage.setItem('authToken', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('services', JSON.stringify(['hr', 'hospital']));

        return {
          success: true,
          user: demoUser,
          services: ['hr', 'hospital']
        };
      }

      // Try to call actual API
      try {
        const response = await authAPI.login(email, password);
        const { data } = response.data;

        setToken(data.token);
        setUser(data.user);
        setServices(data.services);

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('services', JSON.stringify(data.services));

        return {
          success: true,
          user: data.user,
          services: data.services
        };
      } catch (apiErr) {
        // If API fails, return demo mode for demo credentials
        if (email === 'demo@example.com' && password === 'demo123') {
          const demoUser = {
            id: '1',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            department: 'Engineering',
            role: 'EMPLOYEE',
            services: ['hr', 'hospital', 'hotel']
          };
          const demoToken = 'demo_token_' + Date.now();

          setToken(demoToken);
          setUser(demoUser);
          setServices(['hr', 'hospital', 'hotel']);

          localStorage.setItem('authToken', demoToken);
          localStorage.setItem('user', JSON.stringify(demoUser));
          localStorage.setItem('services', JSON.stringify(['hr', 'hospital', 'hotel']));

          return {
            success: true,
            user: demoUser,
            services: ['hr', 'hospital', 'hotel']
          };
        }
        throw apiErr;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setServices([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('services');
    authAPI.logout();
  };

  const isAuthenticated = !!token && !!user;

  const hasService = (serviceName) => services.includes(serviceName);

  const value = {
    user,
    token,
    services,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    hasService,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Export AuthContext itself for use in other components
export { AuthContext };
