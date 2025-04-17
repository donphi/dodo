import React, { ReactNode, useEffect, useState } from 'react';
import BackButton from '../back_button';
import { useRouter } from 'next/router';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  onBackClick?: () => void;
}


export function PageContainer({ children, className = '', onBackClick }: PageContainerProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Check for dark mode on component mount and when theme changes
  useEffect(() => {
    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Set up observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push('/');
    }
  };

  return (
    <div className={`relative isolate min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-300 via-pink-200 to-indigo-500 opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
        />
      </div>
      <BackButton onClick={handleBackClick} />
      <div className="mt-6 flex justify-center">
        <img
          alt="Dodo"
          src={isDarkMode ? "/dodo_logo_dark.svg" : "/dodo_logo.svg"}
          className="h-12 w-auto"
        />
      </div>
      <div className="mt-10 w-full bg-transparent dark:bg-transparent px-6 py-12 sm:max-w-[480px] sm:mx-auto sm:px-12 lg:px-8">
        {children}
      </div>
    </div>
  );
}