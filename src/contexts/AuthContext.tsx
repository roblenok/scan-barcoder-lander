
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { client, isConfigured } = useSupabase();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!client) {
      if (isMountedRef.current) {
        setLoading(false);
      }
      return;
    }

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      if (isMountedRef.current) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (isMountedRef.current) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  const signIn = async (email: string, password: string) => {
    if (!client) throw new Error('Supabase not configured');
    
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!client) throw new Error('Supabase not configured');
    
    const { error } = await client.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!client) throw new Error('Supabase not configured');
    
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      isSupabaseConfigured: isConfigured 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
