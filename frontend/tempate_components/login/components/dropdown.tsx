import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

// Dropdown Component
interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  id: string;
  label: string;
  options: Option[];
  onChange?: (value: string) => void;
  value?: string;
}

export function Dropdown({ id, label, options, onChange, value }: DropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
        {label}
      </label>
      <div className="mt-2 relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-gray-100 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 appearance-none sm:text-sm/6 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}