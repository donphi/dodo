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
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default AuthPageWrapper;
