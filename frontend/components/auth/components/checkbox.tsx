import React from 'react';

// Checkbox Component
interface CheckboxProps {
  id: string;
  label: string;
}

export function Checkbox({ id, label }: CheckboxProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid size-4 grid-cols-1">
          <input
            id={id}
            name={id}
            type="checkbox"
            className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 checked:border-indigo-600 dark:checked:border-indigo-500 checked:bg-indigo-600 dark:checked:bg-indigo-500 indeterminate:border-indigo-600 dark:indeterminate:border-indigo-500 indeterminate:bg-indigo-600 dark:indeterminate:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400 disabled:border-gray-300 dark:disabled:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:checked:bg-gray-100 dark:disabled:checked:bg-gray-800 forced-colors:appearance-auto"
          />
          <svg
            fill="none"
            viewBox="0 0 14 14"
            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
          >
            <path
              d="M3 8L6 11L11 3.5"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-has-[:checked]:opacity-100"
            />
            <path
              d="M3 7H11"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-has-[:indeterminate]:opacity-100"
            />
          </svg>
        </div>
      </div>
      <label htmlFor={id} className="block text-sm/6 text-gray-900 dark:text-gray-100">
        {label}
      </label>
    </div>
  );
}

