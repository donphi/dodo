import React from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import BackButton from '../../back_button';

/**
 * Breadcrumbs component that can be reused across all pages
 */

interface BreadcrumbStep {
  name: string;
  // Add more properties if needed (e.g., href, icon, etc.)
}

interface BreadcrumbsProps {
  steps: BreadcrumbStep[];
  currentStep: number;
  onStepBack?: (step: number) => void;
}

export function Breadcrumbs({ steps, currentStep, onStepBack }: BreadcrumbsProps) {
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <nav
      aria-label="Progress"
      className="mb-8 relative w-full max-w-[95%] sm:max-w-[400px] mx-auto"
    >
      {/*
        Breadcrumbs use max-w-form (480px) on desktop and full width on mobile.
        This ensures consistent responsive behavior with other form elements.
      */}
      {currentStep > 0 && onStepBack && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton onClick={() => onStepBack(currentStep - 1)} />
        </div>
      )}
      <ol role="list" className="flex items-center justify-center sm:max-w-full">
        {steps.map((step, stepIdx) => {
          let status;
          if (stepIdx < currentStep) status = 'complete';
          else if (stepIdx === currentStep) status = 'current';
          else status = 'upcoming';

          return (
            <li
              key={step.name}
              className={classNames(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-6' : '', 'relative')}
            >
              {status === 'complete' ? (
                <>
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="h-0.5 w-full bg-indigo-600 dark:bg-indigo-500" />
                  </div>
                  
                  <a
                    href="#"
                    className="relative flex size-5 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <CheckIcon aria-hidden="true" className="size-3 text-white dark:text-gray-900" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              ) : status === 'current' ? (
                <>
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  
                  <a
                    href="#"
                    aria-current="step"
                    className="relative flex size-5 items-center justify-center rounded-full border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-gray-800"
                  >
                    <span aria-hidden="true" className="size-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              ) : (
                <>
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  
                  <a
                    href="#"
                    className="group relative flex size-5 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600"
                    />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
