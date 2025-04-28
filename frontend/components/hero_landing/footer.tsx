import React from 'react';

const links = [
  { name: 'Launch Dodo', href: '/login' },
  { name: 'Contact', href: '/contact-us' },
  { name: 'Terms of Service', href: '/terms-of-service' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
];

const social = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: (props: React.ComponentProps<'svg'>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <title>LinkedIn</title>
        <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.25c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.25 11.25h-3v-5.5c0-1.381-.028-3.156-1.922-3.156-1.924 0-2.221 1.504-2.221 3.055v5.601h-3v-10h2.885v1.367h.041c.402-.762 1.384-1.563 2.848-1.563 3.045 0 3.607 2.005 3.607 4.614v5.582z"/>
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/biobankly',
    icon: (props: React.ComponentProps<'svg'>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <title>GitHub</title>
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function Footer(): React.ReactElement {
  return (
    <footer className="transition-colors duration-300">
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
          &copy; {new Date().getFullYear()} Dodo by Biobankly LTD. All rights reserved.
        </p>
      </div>
    </footer>
  );
}