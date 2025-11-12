// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (username: string, avatarFile?: File) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // load profile from DB
  const loadProfile = async (userId: string) => {
    try {
      console.debug('[Auth] loadProfile -> fetching profile for', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Auth] loadProfile error:', error);
        throw error;
      }
      setProfile(data ?? null);
      console.debug('[Auth] loadProfile -> profile loaded', data);
    } catch (err) {
      console.error('[Auth] Error loading profile:', err);
      setProfile(null);
    } finally {
      // don't forcibly set loading false here if other work is expected,
      // but safe to clear here in this app shape
      setLoading(false);
    }
  };

  // upsert profile row from auth user metadata (called when we have a session)
  const upsertProfileFromAuth = async (u: User) => {
    if (!u?.id) return null;
    try {
      console.debug('[Auth] upsertProfileFromAuth -> for user', u.id);
      const profileRow: Partial<Profile> = {
        id: u.id,
        email: u.email ?? null,
        // prefer DB later; for new users use metadata name if available
        username: u.user_metadata?.name ?? null,
        avatar_url: (u.user_metadata?.avatar_url ?? u.user_metadata?.picture) ?? null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(profileRow, { returning: 'minimal' });
      if (error) {
        // upsert may fail on signup if session/RLS blocks; log and continue
        console.warn('[Auth] upsertProfileFromAuth warning:', error);
      } else {
        console.debug('[Auth] upsertProfileFromAuth -> upserted successfully');
      }
    } catch (err) {
      console.error('[Auth] upsertProfileFromAuth error:', err);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      try {
        console.debug('[Auth] getSession -> starting');
        const { data } = await supabase.auth.getSession();
        const currentUser = data?.session?.user ?? null;
        if (!mounted) return;
        setUser(currentUser);
        console.debug('[Auth] getSession -> currentUser', currentUser);

        if (currentUser) {
          // Ensure a profile row exists or is updated (will succeed only when session is active)
          await upsertProfileFromAuth(currentUser);
          await loadProfile(currentUser.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Error getting session:', err);
        if (mounted) setLoading(false);
      }
    })();

    // Safety fallback: if something hangs, clear loading after 8s to avoid permanent spinner
    safetyTimer = setTimeout(() => {
      console.warn('[Auth] Safety timer fired - setting loading false to avoid permanent spinner');
      setLoading(false);
    }, 8000);

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        console.debug('[Auth] onAuthStateChange -> event', _event);
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          // when a user signs in or completes the flow, upsert their profile and fetch it
          try {
            await upsertProfileFromAuth(newUser);
          } catch (err) {
            console.error('[Auth] upsert on auth change failed:', err);
          }
          await loadProfile(newUser.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] onAuthStateChange handler error:', err);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (safetyTimer) clearTimeout(safetyTimer);
      try {
        subscription?.unsubscribe();
      } catch (err) {
        console.warn('[Auth] subscription unsubscribe error:', err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange will handle profile fetch/upsert
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const createdUser = data?.user ?? null;
    if (createdUser) {
      try {
        await supabase.from('profiles').upsert(
          {
            id: createdUser.id,
            username: username ?? createdUser.user_metadata?.name ?? null,
            email: createdUser.email ?? null,
            avatar_url: createdUser.user_metadata?.picture ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { returning: 'minimal' }
        );
      } catch (err) {
        console.warn('[Auth] Could not upsert profile immediately after signup:', err);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const updateProfile = async (username: string, avatarFile?: File) => {
    if (!user) throw new Error('No user logged in');
    setLoading(true);

    try {
      let avatar_url = profile?.avatar_url ?? null;

      if (avatarFile) {
        // Ensure bucket 'avatars' exists in Supabase Storage
        const fileExt = avatarFile.name.split('.').pop() ?? 'png';
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData, error: urlError } = supabase.storage.from('avatars').getPublicUrl(fileName);
        if (urlError) throw urlError;
        avatar_url = urlData?.publicUrl ?? null;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            username,
            avatar_url,
            updated_at: new Date().toISOString(),
          },
          { returning: 'representation' }
        )
        .select();

      if (error) throw error;

      // reload fresh profile
      await loadProfile(user.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile }}>
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
