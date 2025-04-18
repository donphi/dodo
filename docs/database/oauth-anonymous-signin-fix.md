# OAuth Authentication "Anonymous Sign-ins Disabled" Fix

## Issue Description

When using Google or GitHub OAuth with Supabase, users encounter the following error after authorizing with the provider and filling in registration details:

```
Anonymous sign-ins are disabled
```

## Root Cause

This error is misleading. The issue is not with anonymous authentication but rather with how the OAuth flow is handled in the application. Specifically:

1. The OAuth flow successfully authenticates the user with the provider (Google/GitHub)
2. The user is redirected to the registration flow to complete their profile
3. When the user completes the registration flow, the application fails to properly update their profile in Supabase
4. The "anonymous sign-ins are disabled" error occurs because Supabase is trying to create a new session without proper authentication

## Solution Implemented

We've fixed this issue by modifying the `FinishStep` component in `RegistrationFlow.tsx` to properly update the user's profile in Supabase after OAuth login:

```typescript
const handleComplete = async () => {
  try {
    setLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
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
    
    // Now proceed with completion
    if (onComplete) {
      onComplete(formData);
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    setError(err.message || 'Failed to complete registration');
  } finally {
    setLoading(false);
  }
};
```

## Additional Supabase Configuration Required

In addition to the code changes, you need to make the following changes in your Supabase dashboard:

1. **Enable Anonymous Sign-ins (Temporary Solution)**:
   - Navigate to your Supabase project dashboard
   - Go to **Authentication** > **Providers**
   - Scroll down to find the **Anonymous** provider
   - Toggle it to **Enabled**
   - Save the changes

2. **Verify OAuth Provider Configuration**:
   - Navigate to your Supabase project dashboard
   - Go to **Authentication** > **Providers**
   - Ensure that **Google** and **GitHub** are enabled
   - Verify that the correct **Client ID** and **Client Secret** are entered for each provider
   - Save the changes

3. **Check Redirect URLs**:
   - In your Supabase dashboard, go to **Authentication** > **URL Configuration**
   - Copy the **Site URL** and **Redirect URLs**
   - Go to your Google Cloud Console and GitHub OAuth App settings
   - Ensure that the **Authorized redirect URIs** include:
     - `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`
     - Any custom redirect URLs you're using in your application

## Long-term Solution

If enabling anonymous sign-ins resolves the issue but you don't want to allow anonymous authentication in your application:

1. Create a support ticket with Supabase to investigate why OAuth authentication is being affected by the anonymous sign-in setting
2. Consider implementing a server-side authentication flow using the Supabase Admin API, which can bypass certain client-side restrictions

## Testing the Fix

To verify that the fix works:

1. Try logging in with Google or GitHub
2. Complete the registration flow
3. You should be redirected to the dashboard without any errors
4. Check the Supabase database to ensure the user profile was created correctly

## Related Documentation

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-github)