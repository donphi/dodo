import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { AuthTemplate } from './AuthTemplate';
import { TextInput } from './components/text_field';
import { Button } from './components/button';
import Image from 'next/image';

interface LoginFormProps {
  onOAuthLogin?: (provider: string) => void;
  onEmailLogin?: (email: string, password: string) => void;
  error?: string | null;
}

export function LoginForm({ onOAuthLogin, onEmailLogin, error }: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (onEmailLogin) {
      onEmailLogin(email, password);
    } else {
      // Default login handling if no callback provided
      console.log('Login with:', email, password);
    }
  };
  
  const handleOAuthLogin = (provider: string) => {
    if (onOAuthLogin) {
      onOAuthLogin(provider);
    } else {
      console.log(`Login with ${provider}`);
      // Default OAuth handling logic
    }
  };

  // Define logo component for the AuthTemplate
  const logo = <Image alt="Dodo" src="/dodo_logo.svg" className="mx-auto h-12 w-auto" width={48} height={48} priority />;

  // Define social providers for the AuthTemplate
  const socialProviders = [
    {
      name: 'Google',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path
            d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
            fill="#EA4335"
          />
          <path
            d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
            fill="#4285F4"
          />
          <path
            d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
            fill="#FBBC05"
          />
          <path
            d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
            fill="#34A853"
          />
        </svg>
      ),
      onClick: () => handleOAuthLogin('Google'),
    },
    {
      name: 'GitHub',
      icon: (
        <svg
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="size-5 fill-[#24292F] dark:fill-white"
        >
          <path
            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
            clipRule="evenodd"
            fillRule="evenodd"
          />
        </svg>
      ),
      onClick: () => handleOAuthLogin('GitHub'),
    },
  ];

  return (
    <AuthTemplate
      logo={logo}
      title="Sign in to your account"
      footerText="Not a member?"
      footerLinkText="Register now"
      footerLinkHref="/register"
      socialProviders={socialProviders}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <TextInput
            id="email"
            label="Email address"
            type="email"
            required={true}
            autoComplete="email"
            value={email}
            onChange={(id, value) => setEmail(value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Password
            </label>
            <div className="text-sm">
              <a
                href="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Forgot password?
              </a>
            </div>
          </div>
          <div className="mt-2">
            <TextInput
              id="password"
              label=""
              type="password"
              required={true}
              autoComplete="current-password"
              value={password}
              onChange={(id, value) => setPassword(value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-4 mx-auto max-w-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div>
          <Button type="submit">Sign in</Button>
        </div>
      </form>
    </AuthTemplate>
  );
}


