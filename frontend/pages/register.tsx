import React from 'react';
import { StandardRegistration } from '../components/auth/RegistrationFlow';
import AuthPageWrapper from '../components/auth/AuthPageWrapper';

const RegisterPage: React.FC = () => {
  return (
    <AuthPageWrapper>
      <StandardRegistration />
    </AuthPageWrapper>
  );
};

export default RegisterPage;
