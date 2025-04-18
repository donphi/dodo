import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import AuthPageWrapper from '../components/auth/AuthPageWrapper';

const LoginPage = () => {
  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    // Implement OAuth login logic here
  };

  return (
    <AuthPageWrapper>
      <LoginForm onOAuthLogin={handleOAuthLogin} />
    </AuthPageWrapper>
  );
};

export default LoginPage;
