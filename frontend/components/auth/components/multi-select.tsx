import React from 'react';
import { Checkbox } from './checkbox';

// Multi-select Component
interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  id: string;
  label: string;
  options: Option[];
}

export function MultiSelect({ id, label, options }: MultiSelectProps) {
  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900">{label}</label>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <Checkbox key={option.value} id={`${id}-${option.value}`} label={option.label} />
        ))}
      </div>
    </div>
  );
}

