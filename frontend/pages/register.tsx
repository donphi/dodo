import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { StandardRegistration, RegistrationFlow } from '../components/auth/RegistrationFlow';
import AuthPageWrapper from '../components/auth/AuthPageWrapper';
import { supabase } from '../lib/supabaseClient';

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOAuth, setIsOAuth] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          // User is authenticated
          const { provider_token, provider_refresh_token } = session;
          
          // Check if this is an OAuth login
          if (provider_token || provider_refresh_token) {
            // This is an OAuth login, get the provider
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user?.app_metadata?.provider) {
              setIsOAuth(true);
              setProvider(user.app_metadata.provider);
            }
          } else {
            // Regular login, check if user has completed onboarding
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              // PGRST116 is "no rows returned" error, which means the profile doesn't exist
              throw profileError;
            }
            
            // If profile exists and has required fields, redirect to dashboard
            if (profile && profile.role && profile.experience) {
              router.push('/dashboard');
              return;
            }
          }
        }
      } catch (err: any) {
        console.error('Error checking session:', err);
        setError(err.message || 'An error occurred while checking your session');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [router]);

  const handleRegistrationComplete = async (formData: Record<string, any>) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Update or create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          fullName: formData.fullName,
          role: formData.role,
          experience: formData.experience,
          country: formData.country,
          institution: formData.institution,
          sector: formData.sector,
          expertise: formData.expertise,
          ukBiobank: formData.ukBiobank,
          otherBiobanks: formData.otherBiobanks,
          ethics: formData.ethics,
          updated_at: new Date().toISOString()
        });
        
      if (profileError) {
        throw profileError;
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save your profile information');
    }
  };

  if (loading) {
    return (
      <AuthPageWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <RegistrationFlow
        isOAuth={isOAuth}
        provider={provider}
        onComplete={handleRegistrationComplete}
      />
    </AuthPageWrapper>
  );
};

export default RegisterPage;
