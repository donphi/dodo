import React, { ReactNode } from 'react';
import Footer from '../hero_landing/footer';

interface AuthPageWrapperProps {
  children: ReactNode;
}

/**
 * A wrapper component for all authentication pages
 * Provides consistent layout with footer
 */
const AuthPageWrapper: React.FC<AuthPageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default AuthPageWrapper;
