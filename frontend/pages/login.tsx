import React from 'react';
import { UnifiedLogin } from '../tempate_components/login/authentication_gateway';
import Footer from '../tempate_components/hero_landing/footer';

const LoginPage = () => {
  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    // Implement OAuth login logic here
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <UnifiedLogin onOAuthLogin={handleOAuthLogin} />
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
