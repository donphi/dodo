import React from 'react';

// Text Input Field Component
interface TextInputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}

export function TextInput({
  id,
  label,
  type = 'text',
  required = false,
  autoComplete = '',
}: TextInputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}
      <div className="mt-2">
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          autoComplete={autoComplete}
          className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500 sm:text-sm/6"
        />
      </div>
    </div>
  );
}