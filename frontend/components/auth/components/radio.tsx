import React from 'react';

// Radio Group Component
interface Option {
  value: string;
  label: string;
}

interface RadioGroupProps {
  id: string;
  label: string;
  options: Option[];
  value?: string;
  onChange?: (id: string, value: string) => void;
}

export function RadioGroup({ id, label, options, value = '', onChange }: RadioGroupProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(id, e.target.value);
    }
  };

  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{label}</label>
      <div className="mt-2 space-y-4">
        {options.map((option) => (
          <div key={option.value} className="flex items-center mb-4">
            <input
              id={`${id}-${option.value}`}
              name={id}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor={`${id}-${option.value}`} className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

