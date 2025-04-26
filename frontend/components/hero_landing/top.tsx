import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import React from 'react'
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
    <div>
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
            <button
              onClick={() => {
                const faqElement = document.getElementById('faq');
                if (faqElement) {
                  // Get the target position (centered in the viewport)
                  const windowHeight = window.innerHeight;
                  const faqHeight = faqElement.getBoundingClientRect().height;
                  // Calculate offset to center the FAQ in the viewport
                  const offset = (windowHeight - faqHeight) / 2;
                  const targetPosition = faqElement.getBoundingClientRect().top + window.pageYOffset - offset;
                  const startPosition = window.pageYOffset;
                  const distance = targetPosition - startPosition;
                  const duration = 1000; // ms
                  let start: number | null = null;
                  
                  // Easing function: easeInOutCubic
                  const easeInOutCubic = (t: number): number => {
                    return t < 0.5
                      ? 4 * t * t * t
                      : 1 - Math.pow(-2 * t + 2, 3) / 2;
                  };
                  
                  // Animation function
                  function animation(currentTime: number) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const progress = Math.min(timeElapsed / duration, 1);
                    const easeProgress = easeInOutCubic(progress);
                    
                    window.scrollTo(0, startPosition + distance * easeProgress);
                    
                    if (timeElapsed < duration) {
                      requestAnimationFrame(animation);
                    }
                  }
                  
                  // Start animation
                  requestAnimationFrame(animation);
                }
              }}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-gray-900/5 dark:bg-white/5 p-2 ring-1 ring-inset ring-gray-900/10 dark:ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                alt="TidyTree - Dashboard"
                src={isDarkMode ? "/top_dark_s_n.png" : "/top_light_s_n.png"}
                width={2345}
                height={1416}
                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}