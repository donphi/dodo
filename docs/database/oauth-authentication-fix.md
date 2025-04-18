# OAuth Authentication Fix

## Issue Description

When attempting to log in with Gmail (Google OAuth), users encounter the following error:

```
Anonymous signins are disabled
```

This error occurs despite the OAuth providers being correctly configured in the Supabase dashboard.

## Root Cause Analysis

This error message is misleading. OAuth authentication (like Google) is not the same as anonymous authentication in Supabase. The error suggests that there's a configuration issue in the Supabase authentication settings.

There are several possible causes:

1. **OAuth Provider Configuration**: The Google OAuth provider might not be properly configured in the Supabase dashboard.
2. **Redirect URL Mismatch**: The redirect URL in your Google Cloud Console might not match the one expected by Supabase.
3. **Authentication Settings**: Certain authentication settings in Supabase might be restricting the OAuth flow.

## Solution

Follow these steps to fix the OAuth authentication issue:

### 1. Verify OAuth Provider Configuration

1. Navigate to your Supabase project dashboard
2. Go to **Authentication** > **Providers**
3. Ensure that **Google** is enabled
4. Verify that the correct **Client ID** and **Client Secret** are entered
5. Save the changes

### 2. Enable Anonymous Sign-ins (Temporary Solution)

Although OAuth is not anonymous authentication, enabling anonymous sign-ins might resolve the issue as a temporary solution:

1. Navigate to your Supabase project dashboard
2. Go to **Authentication** > **Providers**
3. Scroll down to find the **Anonymous** provider
4. Toggle it to **Enabled**
5. Save the changes

### 3. Check Redirect URLs

1. In your Supabase dashboard, go to **Authentication** > **URL Configuration**
2. Copy the **Site URL** and **Redirect URLs**
3. Go to your [Google Cloud Console](https://console.cloud.google.com/)
4. Navigate to **APIs & Services** > **Credentials**
5. Edit your OAuth 2.0 Client ID
6. Ensure that the **Authorized redirect URIs** include:
   - `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`
   - Any custom redirect URLs you're using in your application

### 4. Update Your Code

Ensure your OAuth login code is correctly implemented:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/register`,
    // Add scopes if needed
    scopes: 'email profile'
  }
});
```

## Verification

After implementing these changes, test the Google OAuth login flow again. You should be able to successfully authenticate without encountering the "Anonymous signins are disabled" error.

## Long-term Solution

If enabling anonymous sign-ins resolves the issue but you don't want to allow anonymous authentication in your application:

1. Create a support ticket with Supabase to investigate why OAuth authentication is being affected by the anonymous sign-in setting
2. Consider implementing a server-side authentication flow using the Supabase Admin API, which can bypass certain client-side restrictions

## Related Documentation

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)