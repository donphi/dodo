import React from 'react';

interface SwitchProps {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  ariaLabel?: string; // Optional: for accessibility if label is not a string
}

export function Switch({
  id,
  label,
  checked,
  onChange,
  className = '',
  ariaLabel,
}: SwitchProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        id={id}
        aria-pressed={checked}
        aria-label={ariaLabel ? ariaLabel : typeof label === 'string' ? label : undefined}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
          checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      <label
        htmlFor={id}
        className="text-sm/6 text-gray-700 dark:text-gray-300 select-none cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}


