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
  value?: string[];
  onChange?: (id: string, value: string[]) => void;
}

export function MultiSelect({ id, label, options, value = [], onChange }: MultiSelectProps) {
  // Handle checkbox change
  const handleCheckboxChange = (checkboxId: string, checked: boolean) => {
    if (!onChange) return;
    
    // Extract the option value from the checkbox ID (format: "id-value")
    const optionValue = checkboxId.replace(`${id}-`, '');
    
    // Update the selected values
    let newValues = [...value];
    if (checked) {
      // Add the value if it's not already in the array
      if (!newValues.includes(optionValue)) {
        newValues.push(optionValue);
      }
    } else {
      // Remove the value if it's in the array
      newValues = newValues.filter(v => v !== optionValue);
    }
    
    // Call the onChange handler with the updated values
    onChange(id, newValues);
  };

  return (
    <div>
      {label && <label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{label}</label>}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            id={`${id}-${option.value}`}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={handleCheckboxChange}
          />
        ))}
      </div>
    </div>
  );
}

