import React from 'react';
// Import the registration flow template
import { StandardRegistration } from '../tempate_components/login/onboarding_flow';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
      <StandardRegistration />
    </div>
  );
};

export default RegisterPage;
