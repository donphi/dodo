# Registration Flow Fixes

## Issue Description

The registration flow had several issues:

1. Password mismatch validation wasn't working
2. Even when all fields were filled in, it was showing "Email and password are required"
3. There was uncertainty about whether data was being added to Supabase
4. User account was being created at the beginning of the registration flow instead of at the end
5. The "Field of Expertise" section needed a proper heading to distinguish it from the Sector field

## Root Cause

The form components (TextInput and Checkbox) weren't properly connected to the parent component's state. This meant that:

- User input wasn't being captured in the formData state
- Validation logic couldn't access the actual values entered by users
- Data sent to Supabase might be incomplete or empty

## Fixes Implemented

### 1. Updated TextInput Component

Added value and onChange props to the TextInput component to properly connect it to the parent component's state:

```tsx
interface TextInputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  value?: string;
  onChange?: (id: string, value: string) => void;
}

export function TextInput({
  id,
  label,
  type = 'text',
  required = false,
  autoComplete = '',
  value = '',
  onChange,
}: TextInputProps) {
  // ...
  <input
    // ...
    value={value}
    onChange={(e) => onChange && onChange(id, e.target.value)}
  />
  // ...
}
```

### 2. Updated Checkbox Component

Added checked and onChange props to the Checkbox component:

```tsx
interface CheckboxProps {
  id: string;
  label: string | React.ReactNode;
  required?: boolean;
  checked?: boolean;
  onChange?: (id: string, value: boolean) => void;
}

export function Checkbox({ id, label, required = false, checked = false, onChange }: CheckboxProps) {
  // ...
  <input
    // ...
    checked={checked}
    onChange={(e) => onChange && onChange(id, e.target.checked)}
  />
  // ...
}
```

### 3. Connected Form Inputs to State in AccountStep

Updated the AccountStep component to properly connect form inputs to the state:

```tsx
<TextInput 
  id="fullName" 
  label="Full Name" 
  required={true} 
  autoComplete="name" 
  value={formData.fullName || ''}
  onChange={handleChange}
/>

<TextInput
  id="email"
  label="Email Address"
  type="email"
  required={true}
  autoComplete="email"
  value={formData.email || ''}
  onChange={handleChange}
/>

// ... other inputs ...

<Checkbox
  id="acceptTerms"
  required={true}
  checked={formData.acceptTerms || false}
  onChange={handleChange}
  // ... label ...
/>
```

### 4. Enhanced Validation Logic

Improved the validation in handleAccountSubmit to check all required fields:

```tsx
const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);

  // Validate all required fields are present
  if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.acceptTerms) {
    setError('All fields are required and terms must be accepted');
    return;
  }

  // Validate passwords match
  const password = formData.password;
  const confirmPassword = formData.confirmPassword;
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);
  // ... rest of the function ...
}
```

### 5. Consolidated Error Messages

Ensured that error messages are only displayed in one location - at the top of the form between the breadcrumbs and the form fields. This provides a consistent user experience and avoids confusion from multiple error messages.

Changes made:
1. Removed duplicate error message at the bottom of the AccountStep component
2. Removed local password validation in the AccountStep component
3. Removed the password error message that was displayed within the form
4. Centralized all validation in the parent RegistrationFlow component

Before:
```tsx
// In AccountStep component
export function AccountStep({ onSubmit, formData = {}, onFormChange, loading = false, error = null }: AccountStepProps) {
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (id: string, value: any) => {
    // Local password validation logic
    if (id === 'password' || id === 'confirmPassword') {
      setPasswordError('');
      const otherField = id === 'password' ? 'confirmPassword' : 'password';
      const otherValue = formData[otherField];
      if (value && otherValue && value !== otherValue) {
        setPasswordError('Passwords do not match');
      }
    }
    // ...
  };

  return (
    <form>
      {/* ... */}
      <div>
        <TextInput id="confirmPassword" ... />
        {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
      </div>
      
      {/* Duplicate error message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900 p-2 mb-2">
          <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
        </div>
      )}
    </form>
  );
}
```

After:
```tsx
// In AccountStep component
export function AccountStep({ onSubmit, formData = {}, onFormChange, loading = false, error = null }: AccountStepProps) {
  // Remove local password error state and validation
  // All validation is now handled at the parent component level
  
  const handleChange = (id: string, value: any) => {
    if (onFormChange) {
      onFormChange(id, value);
    }
  };

  return (
    <form>
      {/* ... */}
      <TextInput id="confirmPassword" ... />
      {/* No local error messages */}
    </form>
  );
}
```

### 6. Delayed User Creation

We've moved the Supabase signUp call from the first step of the registration flow to the final step. This ensures that user accounts are only created when the registration process is fully completed.

Before:
```tsx
// In handleAccountSubmit (first step)
const { data, error: signUpError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
    },
  },
});
```

After:
```tsx
// In handleRegistrationComplete (final step)
const { data, error: signUpError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
    },
  },
});

// Then update profile with all collected information
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    id: data.user.id,
    email: data.user.email,
    fullName: formData.fullName,
    // ... other profile fields
  });
```

### 7. Improved Field of Expertise Section

Added a clear heading and description for the "Field of Expertise" section to distinguish it from the Sector field:

```tsx
<div className="mt-6">
  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
    Field of Expertise
  </h3>
  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
    Please select all areas that apply to your work
  </p>
  <MultiSelect 
    id="expertise" 
    label="" 
    options={expertiseOptions} 
    value={formData.expertise || []}
    onChange={handleChange}
  />
</div>
```

This provides better visual separation and context for the user, making it clear that they're selecting their fields of expertise after choosing their sector.

## Result

With these changes:

1. Password mismatch validation now works correctly
2. The "Email and password are required" error only appears when fields are actually empty
3. Data is properly sent to Supabase when the form is submitted
4. Error messages are displayed in a single, consistent location at the top of the form
5. User account is only created after completing all registration steps
6. The "Field of Expertise" section now has a clear heading and description

## Future Improvements

1. Consider adding more robust form validation using a library like Formik or React Hook Form
2. Add client-side validation for email format, password strength, etc.
3. Implement more detailed error messages from Supabase
4. Improve form field organization and labeling for better user experience
5. Fix error message display in login form

### 8. Improved AffiliationStep Component

We've made several improvements to the AffiliationStep component:

1. Reordered the fields to put Sector first, then Organization name
2. Fixed the "Name of your organization or group you represent" field by adding value and onChange props
3. Made all field labels consistent in style and formatting
4. Removed unnecessary subheadings and descriptive text

Before:
```tsx
<form onSubmit={onSubmit} className="space-y-6 w-full">
  <TextInput id="institution" label="Which company or institution are you representing?" required={true} />

  <Dropdown
    id="sector"
    label="Sector"
    options={sectorOptions}
    value={formData.sector}
    onChange={(value) => handleChange('sector', value)}
  />

  <div className="mt-6">
    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
      Field of Expertise
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      Please select all areas that apply to your work
    </p>
    <MultiSelect
      id="expertise"
      label=""
      options={expertiseOptions}
      value={formData.expertise || []}
      onChange={handleChange}
    />
  </div>
</form>
```

After:
```tsx
<form onSubmit={onSubmit} className="space-y-6 w-full">
  <Dropdown
    id="sector"
    label="Sector"
    options={sectorOptions}
    value={formData.sector}
    onChange={(value) => handleChange('sector', value)}
  />

  <TextInput
    id="institution"
    label="Name of your organisation or group you represent"
    required={true}
    value={formData.institution || ''}
    onChange={handleChange}
  />

  <MultiSelect
    id="expertise"
    label="Select the industry or domain you work in"
    options={expertiseOptions}
    value={formData.expertise || []}
    onChange={handleChange}
  />
</form>
```

This provides a more consistent and intuitive user experience, with all fields having the same visual weight and importance.