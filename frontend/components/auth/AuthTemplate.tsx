import React, { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '../back_button';
import { useRouter } from 'next/router';

interface AuthTemplateProps {
  children: ReactNode;
  title?: string;
  logo?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  socialProviders?: Array<{
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
  className?: string;
}

export function AuthTemplate({
  children,
  title,
  logo,
  showBackButton = true,
  onBackClick,
  footerText,
  footerLinkText,
  footerLinkHref,
  socialProviders = [],
  className = '',
}: AuthTemplateProps): React.ReactElement {
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

  // Default logo if none provided
  const defaultLogo = (
    <Image
      alt="Dodo"
      src={isDarkMode ? '/dodo_logo_dark.svg' : '/dodo_logo.svg'}
      className="mx-auto h-12 w-auto"
      width={48}
      height={48}
      priority
    />
  );

  return (
    <div
      className={`relative isolate flex min-h-full flex-1 flex-col justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 sm:px-6 lg:px-8 ${className}`}
    >
      {/* Background gradient effect */}
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

      {/* Back button */}
      {showBackButton && <BackButton onClick={handleBackClick} />}

      {/* Logo and title section */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mt-6 flex justify-center">{logo || defaultLogo}</div>
        {title && (
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
      </div>

      {/* Main content area */}
      <div className="mt-10 mx-auto w-full max-w-[95vw] sm:max-w-form">
        <div className="bg-transparent dark:bg-transparent px-6 py-12 sm:px-12">
          {children}

          {/* Social providers section */}
          {socialProviders.length > 0 && (
            <div>
              <div className="relative mt-10">
                <div className="flex items-center">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="mx-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Or continue with
                  </div>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {socialProviders.map((provider) => (
                  <button
                    key={provider.name}
                    type="button"
                    onClick={provider.onClick}
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-transparent dark:bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-transparent"
                  >
                    {provider.icon}
                    <span className="text-sm font-semibold">{provider.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer link section */}
        {footerText && footerLinkText && (
          <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {footerText}{' '}
            <Link
              href={footerLinkHref || '#'}
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

