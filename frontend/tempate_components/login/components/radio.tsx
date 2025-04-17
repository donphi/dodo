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
}

export function RadioGroup({ id, label, options }: RadioGroupProps) {
  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900">{label}</label>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${id}-${option.value}`}
              name={id}
              type="radio"
              value={option.value}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor={`${id}-${option.value}`} className="ml-3 block text-sm/6 text-gray-900">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}