import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('knowledgetrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('knowledgetrack_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('knowledgetrack_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('knowledgetrack_user', JSON.stringify(res.user));
          }
        } catch {
          // Token is invalid or expired
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('knowledgetrack_token', res.token);
      localStorage.setItem('knowledgetrack_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('knowledgetrack_token', res.token);
      localStorage.setItem('knowledgetrack_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('knowledgetrack_token');
    localStorage.removeItem('knowledgetrack_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('knowledgetrack_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const isAdmin = user?.role === 'Admin';
  const isOwner = user?.role === 'Knowledge Owner';
  const isViewer = user?.role === 'Viewer';

  // Permission checks
  const canEditArticle = (article) => {
    if (!user || !article) return false;
    if (isAdmin) return true;
    if (isOwner) {
      const ownerId = typeof article.owner === 'object' ? article.owner?._id : article.owner;
      const creatorId = typeof article.createdBy === 'object' ? article.createdBy?._id : article.createdBy;
      return user._id === ownerId || user._id === creatorId;
    }
    return false;
  };

  const canReviewArticle = (article) => {
    if (!user || !article) return false;
    if (isAdmin) return true;
    if (isOwner) {
      const ownerId = typeof article.owner === 'object' ? article.owner?._id : article.owner;
      return user._id === ownerId;
    }
    return false;
  };

  const canDeleteArticle = () => isAdmin;
  const canCreateArticle = () => isAdmin || isOwner;
  const canManageUsers = () => isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isOwner,
        isViewer,
        canEditArticle,
        canReviewArticle,
        canDeleteArticle,
        canCreateArticle,
        canManageUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
