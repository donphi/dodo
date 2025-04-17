import React from 'react';
import { UnifiedLogin } from '../tempate_components/login/authentication_gateway';

const LoginPage = () => {
  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    // Implement OAuth login logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
      <UnifiedLogin onOAuthLogin={handleOAuthLogin} />
    </div>
  );
};

export default LoginPage;
