import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Robust storage reader for instant session retention on page refresh
const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('luxestay_user') || sessionStorage.getItem('luxestay_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (!parsed || !parsed.email) return null;
    if (parsed.name === 'Alice Johnson' || parsed.id === 'u_customer_demo') {
      localStorage.removeItem('luxestay_user');
      sessionStorage.removeItem('luxestay_user');
      return null;
    }
    if (parsed.avatar && parsed.avatar.includes('photo-1534528741775')) {
      parsed.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name || 'User')}&background=0284c7&color=fff&bold=true`;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

// Safe persistent storage helper across localStorage & sessionStorage
const safeSetUserStorage = (userObj) => {
  if (!userObj) return; // NEVER wipe storage on passive re-renders!
  try {
    const userStr = JSON.stringify(userObj);
    localStorage.setItem('luxestay_user', userStr);
    sessionStorage.setItem('luxestay_user', userStr);
  } catch (err) {
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('luxestay_cache_') || k.startsWith('luxestay_read_')) {
          localStorage.removeItem(k);
        }
      });
      const userStr = JSON.stringify(userObj);
      localStorage.setItem('luxestay_user', userStr);
      sessionStorage.setItem('luxestay_user', userStr);
    } catch (e) {
      console.warn('Storage quota exceeded, retaining in memory.');
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync user state changes to storage
  useEffect(() => {
    if (user) {
      safeSetUserStorage(user);
    }
  }, [user]);

  // On initial mount / refresh: verify and refresh session from server in background
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const currentStored = getStoredUser();
      if (currentStored?.email) {
        try {
          const token = localStorage.getItem('luxestay_token') || `jwt-token-${currentStored.id}`;
          const res = await fetch(`/api/auth/me?email=${encodeURIComponent(currentStored.email)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data?.user) {
              setUser(data.user);
              safeSetUserStorage(data.user);
            }
          }
        } catch (e) {
          // Keep stored offline/cached user active
        }
      }
      if (isMounted) {
        setAuthLoading(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to guarantee errors are always formatted as human-readable strings (never unrendered objects)
  const extractErrorMessage = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'object') {
      if (err.message && typeof err.message === 'string') return err.message;
      if (err.error && typeof err.error === 'string') return err.error;
      if (err.error && typeof err.error === 'object' && err.error.message) return err.error.message;
      if (err.code && typeof err.code === 'string') return `Notice (${err.code}): ${err.message || 'Operation failed'}`;
      try { return JSON.stringify(err); } catch (e) { return 'An unexpected error occurred.'; }
    }
    return String(err);
  };

  // Robust Helper for Authentication API Calls (handles serverless cold-starts & connection drops with timeout)
  const safeAuthFetch = async (endpoint, payload, timeoutMs = 12000) => {
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
    return { status: 500, data: { error: 'Unable to connect to live authentication server' } };
  };

  // Real HTTP Login API (Direct Live MongoDB Atlas Authentication)
  const login = async (email, password, role = 'customer') => {
    const cleanEmail = String(email || '').trim().toLowerCase();

    // Query live MongoDB Atlas authentication via Backend API
    const { data, status } = await safeAuthFetch('/api/auth/login', { email: cleanEmail, password, role });
    
    if (data?.user) {
      setUser(data.user);
      safeSetUserStorage(data.user);
      if (data.token) {
        try { localStorage.setItem('luxestay_token', data.token); } catch (e) {}
      }
      return data;
    }

    let rawErr = data?.error || data?.message;
    if (status >= 400 && data?.code) {
      rawErr = data.message || data.code;
    }
    let cleanErr = extractErrorMessage(rawErr);
    if (!cleanErr || cleanErr === 'Unable to connect to live authentication server' || status === 402 || status >= 500) {
      cleanErr = 'Unable to connect to the live MongoDB database server. Please ensure the backend server is running and accessible.';
    }

    return { error: cleanErr };
  };

  // Real HTTP Register API (Saves directly to live MongoDB Atlas)
  const register = async (name, email, password, role = 'customer', avatar = null) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();

    const { data, status } = await safeAuthFetch('/api/auth/register', { name: cleanName, email: cleanEmail, password, role, avatar });

    if (data?.user) {
      setUser(data.user);
      safeSetUserStorage(data.user);
      if (data.token) {
        try { localStorage.setItem('luxestay_token', data.token); } catch (e) {}
      }
      return data;
    }

    const cleanErr = extractErrorMessage(data?.error || data?.message || 'Unable to connect to the live MongoDB database server to create account.');
    return { error: cleanErr };
  };


  const loginWithGoogle = async (role = 'customer') => {
    try {
      const { loginWithGoogleFirebase } = await import('../firebase');
      const googleRes = await loginWithGoogleFirebase();
      
      if (googleRes?.error) {
        return { error: extractErrorMessage(googleRes.error) };
      }

      if (googleRes?.user) {
        const { name, email, avatar, uid } = googleRes.user;
        
        let googleUserPayload = {
          id: `u_google_${uid || Date.now()}`,
          name: name || (email ? email.split('@')[0] : 'Google User'),
          email,
          role,
          avatar: avatar && !avatar.includes('photo-1534528741775')
            ? avatar 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Google User')}&background=0284c7&color=fff&bold=true`,
          phone: '+1 (555) 000-9988',
          country: 'United States'
        };

        const { data } = await safeAuthFetch('/api/auth/google', { name, email, avatar, role, uid });
        if (data?.user) {
          setUser(data.user);
          safeSetUserStorage(data.user);
          return data;
        } else {
          setUser(googleUserPayload);
          safeSetUserStorage(googleUserPayload);
          return { success: true, user: googleUserPayload };
        }
      }
    } catch (e) {
      return { error: extractErrorMessage(e?.message || 'Google sign-in could not be completed.') };
    }
    return { error: 'Google sign-in could not be completed.' };
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
    try {
      localStorage.removeItem('luxestay_user');
      localStorage.removeItem('luxestay_token');
      sessionStorage.removeItem('luxestay_user');
    } catch (e) {}
  };

  const switchRole = async (role) => {
    if (role === 'guest') {
      logout();
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
      authLoading,
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
