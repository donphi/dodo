import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Example() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <div className="relative isolate overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full stroke-gray-200 dark:stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" width="100%" height="100%" strokeWidth={0} />
      </svg>
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:shrink-0 lg:pt-8">
          <img
            alt="Dodo"
            src={isDarkMode ? "/dodo_logo_dark.svg" : "/dodo_logo.svg"}
            className="h-12 w-auto"
          />
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-indigo-600/10 dark:bg-indigo-500/10 px-3 py-1 text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/10 dark:ring-indigo-500/20">
                NEW
              </span>
              <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600 dark:text-gray-300">
                <span>Just shipped</span>
                <ChevronRightIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-pretty text-5xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
            Visualise phenotype networks at scale
          </h1>
          <p className="mt-8 text-pretty text-lg font-medium text-gray-500 dark:text-gray-400 sm:text-xl/8">
          Explore real-world phenotype connections through intuitive, data-driven maps. Discover patterns across the UK Biobank cohort in seconds.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/login"
              className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
            >
              Launch Dodo
            </Link>
            <Link href="/login" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-gray-900/5 dark:bg-white/5 p-2 ring-1 ring-inset ring-gray-900/10 dark:ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                alt="App screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}