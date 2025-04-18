import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { LoginForm } from '../components/auth/LoginForm';
import AuthPageWrapper from '../components/auth/AuthPageWrapper';
import { supabase } from '../lib/supabaseClient';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOAuthLogin = async (provider: string) => {
    try {
      setError(null);
      
      // Convert provider name to lowercase for Supabase
      const providerName = provider.toLowerCase();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerName as any,
        options: {
          redirectTo: `${window.location.origin}/register`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // The redirect is handled by Supabase OAuth flow
    } catch (err: any) {
      console.error('OAuth login error:', err);
      setError(err.message || 'Failed to login with OAuth provider');
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        // Successful login, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(err.message || 'Invalid login credentials');
    }
  };

  return (
    <AuthPageWrapper>
      <LoginForm
        onOAuthLogin={handleOAuthLogin}
        onEmailLogin={handleEmailLogin}
        error={error}
      />
    </AuthPageWrapper>
  );
};

export default LoginPage;
