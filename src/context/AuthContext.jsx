import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('luxestay_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('luxestay_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('luxestay_user');
    }
  }, [user]);

  // Robust Helper for Authentication API Calls (prevents HTML SyntaxError crashes & double fetch delays)
  const safeAuthFetch = async (endpoint, payload) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const data = JSON.parse(text);
        return { status: res.status, data };
      }
    } catch (err) {
      // safe fallback on network disconnect
    }
    return { status: 500, data: { error: 'Unable to connect to authentication server' } };
  };

  // Real HTTP Login API (saves & verifies with MongoDB Atlas)
  const login = async (email, password, role = 'customer') => {
    const { data } = await safeAuthFetch('/api/auth/login', { email, password, role });
    
    if (data?.user) {
      setUser(data.user);
      return data;
    } else if (data?.error) {
      return { error: data.error };
    }
    return { error: 'Unable to connect to authentication server' };
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
        localStorage.setItem('luxestay_user', JSON.stringify(data.user));
        return { success: true, user: data.user, message: data.message };
      }
    } catch (e) {
      // Local fallback on network disconnect
    }
    const newUserState = { ...user, ...updatedData };
    setUser(newUserState);
    localStorage.setItem('luxestay_user', JSON.stringify(newUserState));
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
          localStorage.setItem('luxestay_user', JSON.stringify(found));
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
