'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // First try to get Supabase session
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          // User is authenticated with Supabase
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.email?.split('@')[0] || 'Player',
          });
        } else {
          // Try demo user first
          const { data: demoData, error: demoError } = await supabase.auth.signInWithPassword({
            email: 'astrofarm@soinar.com',
            password: 'metrica10'
          });
          
          if (demoData?.user && !demoError) {
            setUser({
              id: demoData.user.id,
              email: demoData.user.email || 'astrofarm@soinar.com',
              name: 'AstroFarm Demo',
            });
          } else {
            // Fallback to anonymous auth
            const { data, error } = await supabase.auth.signInAnonymously();
            if (data?.user && !error) {
              setUser({
                id: data.user.id,
                email: '',
                name: 'Player',
              });
            } else {
              // Fallback to localStorage
              const savedUser = localStorage.getItem('astrofarm-user');
              if (savedUser) {
                setUser(JSON.parse(savedUser));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || 'Player',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (userData: User) => {
    try {
      // For demo, always use the fixed user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'astrofarm@soinar.com',
        password: 'metrica10'
      });
      
      if (error) {
        // Fallback to anonymous if demo user fails
        console.warn('Demo user login failed, trying anonymous:', error);
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;
        
        if (anonData?.user) {
          userData.id = anonData.user.id;
        }
      } else if (data?.user) {
        userData.id = data.user.id;
        userData.email = data.user.email || 'astrofarm@soinar.com';
      }
      
      // Save user to localStorage
      localStorage.setItem('astrofarm-user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user session:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('astrofarm-user');
    localStorage.removeItem('astrofarm-player-data');
    localStorage.removeItem('astrofarm-selected-location');
    localStorage.removeItem('astrofarm-tutorial-seen');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
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
