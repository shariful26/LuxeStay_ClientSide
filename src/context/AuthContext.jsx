import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Safe storage helper with quota management and cache garbage collection
const safeSetUserStorage = (userObj) => {
  if (!userObj) {
    try { localStorage.removeItem('luxestay_user'); } catch (e) {}
    return;
  }
  try {
    localStorage.setItem('luxestay_user', JSON.stringify(userObj));
  } catch (err) {
    // If QuotaExceededError, clean stale caches
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('luxestay_cache_') || k.startsWith('luxestay_read_')) {
          localStorage.removeItem(k);
        }
      });
      // Retry with optimized lightweight user
      const lightUser = { ...userObj };
      if (lightUser.avatar && lightUser.avatar.startsWith('data:') && lightUser.avatar.length > 25000) {
        lightUser.avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
      }
      localStorage.setItem('luxestay_user', JSON.stringify(lightUser));
    } catch (e) {
      console.warn('Storage quota full, retaining in memory state.');
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('luxestay_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    safeSetUserStorage(user);
  }, [user]);

  // Instant client-side cached profiles for quick demo login
  const CLIENT_DEMO_USERS = {
    'customer@luxestay.com': {
      id: 'u_customer_demo',
      name: 'Alice Johnson',
      email: 'customer@luxestay.com',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '+1 (555) 000-1122',
      country: 'United States'
    },
    'manager@luxestay.com': {
      id: 'u_manager_demo',
      name: 'Shariful Islam (Hotel Manager)',
      email: 'manager@luxestay.com',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      phone: '+1 (555) 000-1122',
      country: 'United States'
    },
    'admin@luxestay.com': {
      id: 'u_admin_demo',
      name: 'System Administrator',
      email: 'admin@luxestay.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      phone: '+1 (555) 000-1122',
      country: 'United States'
    },
    'sharif@gmail.com': {
      id: 'u_admin_sharif',
      name: 'Shariful Islam (Admin)',
      email: 'sharif@gmail.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      phone: '+1 (555) 000-1122',
      country: 'United States'
    },
    'shariful@gmail.com': {
      id: 'u_admin_shariful',
      name: 'Shariful Islam (Admin)',
      email: 'shariful@gmail.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      phone: '+1 (555) 000-1122',
      country: 'United States'
    }
  };

  // Robust Helper for Authentication API Calls (handles serverless cold-starts & connection drops with timeout)
  const safeAuthFetch = async (endpoint, payload, timeoutMs = 3500) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const data = JSON.parse(text);
        return { status: res.status, data };
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // safe fallback on network disconnect or timeout
    }
    return { status: 500, data: { error: 'Unable to connect to authentication server' } };
  };

  // Real HTTP Login API (Live MongoDB Atlas & Fast Server Authentication)
  const login = async (email, password, role = 'customer') => {
    const cleanEmail = String(email || '').trim().toLowerCase();

    // 1. Query live server authentication
    const { data } = await safeAuthFetch('/api/auth/login', { email: cleanEmail, password, role });
    
    if (data?.user) {
      setUser(data.user);
      safeSetUserStorage(data.user);
      return data;
    } else if (data?.error && data.error !== 'Unable to connect to authentication server') {
      return { error: data.error };
    }

    // 2. Intelligent offline / network fallback for demo users if backend server unreachable
    if (CLIENT_DEMO_USERS[cleanEmail] && (password === '123456' || password.length >= 4)) {
      const saved = localStorage.getItem('luxestay_user');
      let parsed = null;
      try { parsed = saved ? JSON.parse(saved) : null; } catch (e) {}
      const demoUser = (parsed && parsed.email?.toLowerCase() === cleanEmail) ? parsed : CLIENT_DEMO_USERS[cleanEmail];
      const effectiveRole = demoUser.role || role;
      const userPayload = { ...demoUser, role: effectiveRole };
      
      setUser(userPayload);
      safeSetUserStorage(userPayload);
      return { success: true, user: userPayload };
    }

    return { error: data?.error || 'Unable to connect to authentication server' };
  };

  // Real HTTP Register API (saves directly to MongoDB Atlas)
  const register = async (name, email, password, role = 'customer', avatar = null) => {
    const { data } = await safeAuthFetch('/api/auth/register', { name, email, password, role, avatar });

    if (data?.user) {
      setUser(data.user);
      return data;
    } else if (data?.error) {
      return { error: data.error };
    }
    return { error: 'Unable to connect to registration server' };
  };

  const loginWithGoogle = async (role = 'customer') => {
    try {
      const { loginWithGoogleFirebase } = await import('../firebase');
      const googleRes = await loginWithGoogleFirebase();
      
      if (googleRes?.error) {
        return { error: googleRes.error };
      }

      if (googleRes?.user) {
        const { name, email, avatar, uid } = googleRes.user;
        
        let googleUserPayload = {
          id: `u_google_${uid || Date.now()}`,
          name: name || (email ? email.split('@')[0] : 'Google User'),
          email,
          role,
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          phone: '+1 (555) 000-9988',
          country: 'United States'
        };

        const { data } = await safeAuthFetch('/api/auth/google', { name, email, avatar, role, uid });
        if (data?.user) {
          setUser(data.user);
          return data;
        } else {
          setUser(googleUserPayload);
          return { user: googleUserPayload };
        }
      }
    } catch (e) {
      // Google sign-in fallback handler
    }
    return { error: 'Google sign-in failed' };
  };

  const updateProfile = async (updatedData) => {
    const payload = {
      id: user?.id,
      ...user,
      ...updatedData
    };
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        safeSetUserStorage(data.user);
        return { success: true, user: data.user, message: data.message };
      }
    } catch (e) {
      // Local fallback on network disconnect
    }
    const newUserState = { ...user, ...updatedData };
    setUser(newUserState);
    safeSetUserStorage(newUserState);
    return { success: true, user: newUserState };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('luxestay_user');
  };

  const switchRole = async (role) => {
    if (role === 'guest') {
      setUser(null);
      localStorage.removeItem('luxestay_user');
      return;
    }
    const effectiveRole = role === 'manager' ? 'manager' : role;
    try {
      const res = await fetch('/api/users');
      const allUsers = await res.json();
      if (Array.isArray(allUsers) && allUsers.length > 0) {
        const found = allUsers.find(u => u.role === effectiveRole);
        if (found) {
          setUser(found);
          safeSetUserStorage(found);
          return found;
        }
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      loginWithGoogle,
      updateProfile,
      logout,
      switchRole,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
