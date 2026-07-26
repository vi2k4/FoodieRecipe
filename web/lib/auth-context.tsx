'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from './auth';

export type Role = 'GUEST' | 'USER' | 'ADMIN';

export interface UserState {
  id?: number | string;
  username?: string;
  email?: string;
  role: Role;
  isVerified: boolean;
}

interface AuthContextType {
  user: UserState;
  setRole: (role: Role) => void;
  login: (email: string, username: string, id?: number | string) => void;
  logout: () => void;
  verify: () => void;
}

const guestUser: UserState = {
  role: 'GUEST',
  isVerified: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(guestUser);

  useEffect(() => {
    const syncUser = () => {
      const session = auth.getSession();
      if (session && session.user) {
        setUser({
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          role: (session.user.role || 'USER') as Role,
          isVerified: session.user.isVerified ?? true,
        });
      } else {
        setUser(guestUser);
      }
    };

    window.addEventListener("foodirecipe:auth-change", syncUser);
    window.addEventListener("storage", syncUser);
    
    // Initial bootstrap
    auth.bootstrap().then(syncUser).catch(syncUser);
    
    return () => {
      window.removeEventListener("foodirecipe:auth-change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const setRole = (role: Role) => {
    setUser((prev) => ({ ...prev, role }));
  };

  const login = (email: string, username: string, id: number | string = 1) => {
    setUser({ id, email, username, role: 'USER', isVerified: true });
  };

  const logout = async () => {
    await auth.logout();
    setUser(guestUser);
  };

  const verify = () => {
    setUser((prev) => ({ ...prev, isVerified: true }));
  };

  return (
    <AuthContext.Provider value={{ user, setRole, login, logout, verify }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
