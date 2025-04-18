import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (err: any) {
        console.error('Error getting initial session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
          
          // Record session in user_sessions table when user signs in
          if (event === 'SIGNED_IN') {
            try {
              // Insert a new record in the user_sessions table
              const { error } = await supabase
                .from('user_sessions')
                .insert({
                  user_id: session.user.id,
                  // arrival_time and id will be automatically set by the database defaults
                });
                
              if (error) {
                console.error('Error recording user session:', error);
              }
            } catch (err) {
              console.error('Failed to record user session:', err);
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // If no profile exists, create one with default values
        const newProfile = {
          id: userId,
          name: user?.user_metadata?.full_name || 'User',
          email: user?.email || '',
          avatar_url: user?.user_metadata?.avatar_url || null
        };
        
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      
      // Redirect to the home page after successful sign out
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // First delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Then delete the user's auth record using our Next.js API route
      try {
        const response = await fetch('/api/delete-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }
      } catch (apiError: any) {
        console.error('Error calling delete-user API:', apiError);
        // During development, the API might not be available
        // In production, this should be properly handled
        console.warn('Account deletion may be incomplete. Please contact support if issues persist.');
      }
      
      // Sign out after deletion
      await signOut();
      
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signOut,
    deleteAccount
  };
}