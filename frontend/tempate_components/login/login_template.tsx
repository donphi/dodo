import React from 'react';
import Link from 'next/link';

interface LoginTemplateProps {
  logo: React.ReactNode;
  title: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  socialProviders?: Array<{
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
}

export function LoginTemplate({
  logo,
  title,
  children,
  footerText = "Not a member?",
  footerLinkText = "Register now",
  footerLinkHref = "/register",
  socialProviders = []
}: LoginTemplateProps): React.ReactElement {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto">
          {logo}
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-transparent dark:bg-transparent px-6 py-12 sm:px-12">
          {children}

          {socialProviders.length > 0 && (
            <div>
              <div className="relative mt-10">
                <div className="flex items-center">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="mx-4 text-sm font-medium text-gray-900 dark:text-gray-100">Or continue with</div>
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

        {footerText && footerLinkText && (
          <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {footerText}{' '}
            <Link href={footerLinkHref || "#"} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}