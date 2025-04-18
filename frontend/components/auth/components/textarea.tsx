import React from 'react';

// TextArea Component
interface TextAreaProps {
  id: string;
  label: string;
  required?: boolean;
  rows?: number;
  autoComplete?: string;
}

export function TextArea({
  id,
  label,
  required = false,
  rows = 4,
  autoComplete = '',
}: TextAreaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
      >
        {label}
      </label>
      <div className="mt-2">
        <textarea
          id={id}
          name={id}
          required={required}
          rows={rows}
          autoComplete={autoComplete}
          className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        />
      </div>
    </div>
  );
}

