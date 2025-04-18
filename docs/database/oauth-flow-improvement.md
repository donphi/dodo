# OAuth Authentication Flow Improvement

## Issue Description

When using Google or GitHub OAuth with Supabase, users were encountering the following issues:

1. The "anonymous sign-ins are disabled" error when trying to update user profiles after OAuth login
2. Users were forced to go through the registration flow every time they logged in with OAuth, even if they had already completed it

## Solution Implemented

We've improved the OAuth authentication flow to address these issues without requiring anonymous sign-ins to be enabled:

### 1. Enhanced OAuth Callback Handling

We've updated the OAuth callback page (`frontend/pages/auth/callback.tsx`) to:

- Check if the user already has a profile in the database
- Redirect returning users directly to the dashboard
- Only send first-time users to the registration flow

```typescript
// Check if the user already has a profile
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

if (profile && profile.role) {
  // User already has a profile, redirect to dashboard
  router.push('/dashboard');
} else {
  // User doesn't have a profile, redirect to registration
  router.push('/register?oauth=true&provider=' + provider);
}
```

### 2. Improved Registration Flow

We've updated the `FinishStep` component in `RegistrationFlow.tsx` to properly handle the authenticated user session:

```typescript
const handleComplete = async () => {
  try {
    setLoading(true);
    
    // First check if we have a session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      // Handle no session case
      // ...
    } else {
      // We have a session, update the profile for the authenticated user
      const user = sessionData.session.user;
      
      // Update the user's profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          fullName: formData.fullName || user.user_metadata?.full_name,
          role: formData.role,
          experience: formData.experience,
          country: formData.country,
          institution: formData.institution,
          sector: formData.sector,
          expertise: formData.expertise,
          ukBiobank: formData.ukBiobank,
          otherBiobanks: formData.otherBiobanks,
          ethics: formData.ethics,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
    }
  } catch (err) {
    // Error handling
  }
};
```

### 3. Modified OAuth Redirect

We've updated the login page to redirect OAuth logins to our custom callback handler:

```typescript
const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
redirectUrl.searchParams.append('provider', provider);

const { error } = await supabase.auth.signInWithOAuth({
  provider: providerName as any,
  options: {
    redirectTo: redirectUrl.toString()
  }
});
```

## Benefits of This Approach

1. **No Anonymous Sign-ins Required**: The solution works without enabling anonymous sign-ins in Supabase
2. **Improved User Experience**: Returning users go directly to the dashboard without repeating the registration flow
3. **Proper Profile Creation**: First-time users still complete the registration flow to provide necessary profile information
4. **Centralized Error Handling**: Better error messages and handling throughout the authentication flow

## Testing the Fix

To verify that the fix works:

1. **First-time OAuth Login**:
   - Log in with Google or GitHub
   - You should be redirected to the registration flow
   - Complete the registration flow
   - You should be redirected to the dashboard

2. **Subsequent OAuth Logins**:
   - Log in with the same OAuth provider
   - You should be redirected directly to the dashboard without seeing the registration flow

## Related Documentation

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)