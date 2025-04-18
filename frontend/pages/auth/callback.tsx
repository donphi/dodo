import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Get the provider from the URL if available
        const { provider } = router.query;
        
        // Get current session
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          setError(authError.message);
          return;
        }
        
        if (authData?.session) {
          // Session exists, user is authenticated
          const userId = authData.session.user.id;
          
          // Check if the user already has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" error, which means the profile doesn't exist
            throw profileError;
          }
          
          if (profile && profile.role) {
            // User already has a profile, redirect to dashboard
            router.push('/dashboard');
          } else {
            // User doesn't have a profile, redirect to registration
            router.push('/register?oauth=true&provider=' +
              (provider || authData.session.user.app_metadata.provider || ''));
          }
        } else {
          setError('Authentication failed');
        }
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'An error occurred during authentication');
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router, router.isReady, router.query]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-4 text-center">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Authenticating...</p>
        </div>
      )}
    </div>
  );
}
