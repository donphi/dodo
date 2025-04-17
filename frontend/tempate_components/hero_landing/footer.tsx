import React from 'react';
import Image from 'next/image';
const links = [
  { name: 'Launch Dodo', href: '/login' },
  { name: 'Contact', href: '/contact-us' },
  { name: 'Terms & Conditions', href: '/terms-of-service' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
];

import Image from 'next/image';

const social = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: () => (
      <div className="text-gray-600 dark:text-gray-300">
        <Image src="/linkedin.svg" alt="LinkedIn" width={24} height={24} />
      </div>
    ),
  },
  {
    name: 'GitHub',
    href: '#',
    icon: () => (
      <div className="text-gray-600 dark:text-gray-300">
        <Image src="/github.svg" alt="GitHub" width={24} height={24} />
      </div>
    ),
  },
];

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium">
          {links.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:underline dark:hover:underline transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>
        <div className="mt-8 flex justify-center gap-x-8">
          {social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:scale-110 transition-all"
              aria-label={item.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <item.icon className="size-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
          &copy; {new Date().getFullYear()} Dodo Group, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}