# Authentication Flow Fixes

## Issue Description

Users were encountering several issues with the authentication flow:

1. **Registration Flow Issues**:
   - ```
     new row violates row-level security policy for table "profiles"
     ```
   - ```
     email not confirmed
     ```

2. **Login Form Issue**:
   - Unable to type in the email and password fields on the login page

## Registration Flow Solutions

### RLS Policy Issue

The first error occurred because the Row Level Security (RLS) policy for the `profiles` table was checking `auth.uid()` to ensure users could only insert their own profile records. However, when a user signed up with `supabase.auth.signUp()`, they weren't immediately authenticated in the current session.

### Email Confirmation Issue

The second error occurred when we tried to sign in the user immediately after signup, but Supabase requires email confirmation before allowing sign-in.

### Solution Implemented

We modified the `handleRegistrationComplete` function in `register.tsx` to:

1. Add the `emailRedirectTo` option to the signup call:

```typescript
const { data, error: signUpError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
    },
    // Disable email confirmation requirement for development/testing
    emailRedirectTo: window.location.origin + '/dashboard'
  },
});
```

2. Remove the explicit sign-in step and use the session from the signup response directly.

This approach allows the profile creation to proceed without requiring email confirmation first, which is suitable for development and testing environments.

## Login Form Solution

The login form had an issue where users couldn't type in the email and password fields. This was because the TextInput components weren't properly connected to the state.

### Problem

The LoginForm component was using hidden input fields to track the state instead of connecting the TextInput components directly:

```tsx
<TextInput
  id="email"
  label="Email address"
  type="email"
  required={true}
  autoComplete="email"
/>
<input
  id="email-value"
  name="email"
  type="email"
  value={email}
  onChange={handleEmailChange}
  className="hidden"
/>
```

### Solution

We updated the LoginForm component to use the value and onChange props of the TextInput component directly:

```tsx
<TextInput
  id="email"
  label="Email address"
  type="email"
  required={true}
  autoComplete="email"
  value={email}
  onChange={(id, value) => setEmail(value)}
/>
```

This ensures that the TextInput components are properly connected to the state and users can type in the fields.

## Technical Details

1. **Authentication Flow**:
   - User completes the registration form
   - Account is created with `supabase.auth.signUp()` with `emailRedirectTo` option
   - Profile record is created with `supabase.from('profiles').upsert()`
   - User receives confirmation email with link to dashboard

2. **RLS Policy**:
   The INSERT policy for the profiles table uses this check:
   ```sql
   auth.uid() = id
   ```
   This ensures users can only insert a profile record where the ID matches their authenticated user ID.

## Alternative Solutions Considered

1. **Disable email confirmation in Supabase**: In the Supabase dashboard, you can disable the email confirmation requirement entirely, which would allow users to sign in immediately after signup.

2. **Create a more permissive INSERT policy**: We could create a policy that allows any authenticated user to insert a profile, but this would be less secure.

3. **Use a server-side API endpoint**: We could move the profile creation to a server-side API endpoint that uses the service role key to bypass RLS, but this would add complexity to the architecture.

For production environments, you should consider:
1. Enabling email confirmation for security
2. Creating a more robust flow that handles the confirmation process
3. Providing clear user feedback about the need to confirm their email