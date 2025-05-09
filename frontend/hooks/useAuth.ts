import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatar_url: string | null;
  last_seen_at?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to update last_seen_at
  const updateLastSeen = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating last_seen_at:', error);
      }
    } catch (err) {
      console.error('Failed to update last_seen_at:', err);
    }
  };

  // Function to insert user session
  const recordUserSession = async (userId: string) => {
    try {
      // Get IP address from an IP service
      let ipAddress = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipError) {
        console.error('Failed to get IP address:', ipError);
        // Continue without IP if the service fails
      }
      
      // Insert the session with IP address
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          arrival_time: new Date().toISOString(),
          ip_address: ipAddress
        });
        
      if (error) {
        console.error('Error recording user session:', error);
      }
    } catch (err) {
      console.error('Failed to record user session:', err);
    }
  };

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
          
          // Update last seen timestamp
          await updateLastSeen(session.user.id);
          
          // Record a session for existing logins too
          await recordUserSession(session.user.id);
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
          
          // Always update last_seen_at when auth state changes
          await updateLastSeen(session.user.id);
          
          // Record session in user_sessions table when user signs in
          if (event === 'SIGNED_IN') {
            await recordUserSession(session.user.id);
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
        .select('id, fullName, email, avatar_url, last_seen_at')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // If no profile exists, create one with default values
        const now = new Date().toISOString();
        const newProfile = {
          id: userId,
          fullName: user?.user_metadata?.full_name || 'User',
          email: user?.email || '',
          avatar_url: user?.user_metadata?.avatar_url || null,
          last_seen_at: now
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
      
      // Delete all user sessions
      const { error: sessionsError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id);
        
      if (sessionsError) {
        console.error('Error deleting user sessions:', sessionsError);
        // Continue with deletion even if sessions deletion fails
      }
      
      // Delete any survey responses if they exist
      const { error: surveyError } = await supabase
        .from('survey_responses')
        .delete()
        .eq('user_id', user.id);
        
      if (surveyError) {
        console.error('Error deleting survey responses:', surveyError);
        // Continue with deletion even if survey deletion fails
      }
      
      // Delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Delete any other user-related data here
      // ...
      
      // Finally delete the user's auth record using our Next.js API route
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
        throw new Error('Failed to delete user account. Please try again or contact support.');
      }
      
      // Sign out after deletion
      await signOut();
      
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message);
      throw err; // Re-throw to allow the component to handle the error
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