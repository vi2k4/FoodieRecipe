'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const defaultUser: UserState = {
  id: 1,
  username: 'Thành viên 1',
  role: 'USER',
  isVerified: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(defaultUser);

  const setRole = (role: Role) => {
    setUser((prev) => ({ ...prev, role }));
  };

  const login = (email: string, username: string, id: number | string = 1) => {
    setUser({ id, email, username, role: 'USER', isVerified: true });
  };

  const logout = () => {
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
