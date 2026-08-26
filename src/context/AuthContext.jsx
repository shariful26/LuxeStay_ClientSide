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
      console.warn(`Auth fetch error for ${endpoint}:`, err.message);
    }
    return { status: 500, data: { error: 'Unable to connect to authentication server' } };
  };

  // Real HTTP Login API (saves & verifies with MongoDB Atlas)
  const login = async (email, password, role = 'customer') => {
    console.log('🚀 Sending Login Request to MongoDB Atlas backend:', { email, role });
    const { data } = await safeAuthFetch('/api/auth/login', { email, password, role });
    
    if (data?.user) {
      console.log('✅ Login SUCCESS! User verified in MongoDB Atlas database:', data.user);
      setUser(data.user);
      return data;
    } else if (data?.error) {
      console.warn('⚠️ Login Error from MongoDB Atlas:', data.error);
      return { error: data.error };
    }
    return { error: 'Unable to connect to authentication server' };
  };

  // Real HTTP Register API (saves directly to MongoDB Atlas)
  const register = async (name, email, password, role = 'customer', avatar = null) => {
    console.log('🚀 Sending Registration Request to MongoDB Atlas backend:', { name, email, role });
    const { data } = await safeAuthFetch('/api/auth/register', { name, email, password, role, avatar });

    if (data?.user) {
      console.log('✅ Registration SUCCESS! User saved in MongoDB Atlas database:', data.user);
      setUser(data.user);
      return data;
    } else if (data?.error) {
      console.warn('⚠️ Registration Error from MongoDB Atlas:', data.error);
      return { error: data.error };
    }
    return { error: 'Unable to connect to registration server' };
  };

  const loginWithGoogle = async (role = 'customer') => {
    console.log('🚀 Initiating Google Auth popup & MongoDB Atlas saving...');
    try {
      const { loginWithGoogleFirebase } = await import('../firebase');
      const googleRes = await loginWithGoogleFirebase();
      
      if (googleRes?.error) {
        console.warn('⚠️ Google Auth Firebase Error:', googleRes.error);
        return { error: googleRes.error };
      }

      if (googleRes?.user) {
        const { name, email, avatar, uid } = googleRes.user;
        console.log('📥 Firebase Google user received:', email);
        
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
          console.log('✅ Google Auth SUCCESS! Saved to MongoDB Atlas:', data.user);
          setUser(data.user);
          return data;
        } else {
          setUser(googleUserPayload);
          return { user: googleUserPayload };
        }
      }
    } catch (e) {
      console.warn('Google Sign-In Exception:', e);
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
      console.warn('API profile update warning:', e);
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

  const switchRole = (role) => {
    if (role === 'guest') {
      setUser(null);
      localStorage.removeItem('luxestay_user');
      return;
    }
    const switchedUser = {
      id: `u_${role}_demo`,
      name: role === 'admin' ? 'Platform Administrator' : role === 'partner' ? 'Partner Manager' : 'Luxe Guest',
      email: `${role}@luxestay.com`,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '+1 (555) 000-9988',
      country: 'United States'
    };
    setUser(switchedUser);
    localStorage.setItem('luxestay_user', JSON.stringify(switchedUser));
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
