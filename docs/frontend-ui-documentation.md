# Frontend UI Documentation

## Authentication Flow Components

### AuthenticationGateway Component (renamed from UnifiedLogin)

The `AuthenticationGateway` component is a unified authentication interface that combines both standard email/password login and OAuth login options (Google, GitHub) in a single, vertically-aligned component. This component replaces the previous split implementation where different authentication methods were handled by separate components.

**Location:** `frontend/tempate_components/login/authentication_gateway.tsx`

**Features:**
- Consistent styling and layout using the PageContainer component
- Proper vertical alignment of content
- Consistent background display
- Support for both standard email/password login and OAuth providers
- Dark mode support with automatic theme detection

**Props:**
- `onOAuthLogin`: Optional callback function that receives the provider name ('Google' or 'GitHub') when an OAuth login button is clicked

**Usage:**
```tsx
import { AuthenticationGateway } from '../tempate_components/login/authentication_gateway';

const LoginPage: React.FC = () => {
  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    // Implement OAuth login logic here
  };

  return (
    <AuthenticationGateway onOAuthLogin={handleOAuthLogin} />
  );
};
```

## Authentication Workflow

The authentication system supports three main user flows:

### 1. Standard Email/Password Login

When a user comes to the site and clicks on the Dodo logo:
- They are taken to the login page (`/login`) which displays the `AuthenticationGateway` component
- If they have previously registered with email/password, they can enter their credentials and log in directly
- The system validates their credentials against Supabase and grants access to the dashboard if valid

### 2. Standard Registration (5-step onboarding)

If a user doesn't have an account and prefers not to use OAuth:
- From the login page, they click "Register now"
- They are taken to the registration page (`/register`) which uses the `StandardRegistration` component
- They complete the 5-step onboarding process with breadcrumb navigation:
  1. Account (create email/password)
  2. Profile
  3. Affiliation
  4. Biobank Access
  5. Finish
- After completion, they can log in using their email/password

### 3. OAuth Login/Registration (Google or GitHub)

If a user clicks on either the Google or GitHub button:
- The system initiates OAuth authentication with the selected provider
- After successful OAuth authentication, the system checks Supabase to determine if the user has registered before
- If the user is already registered:
  - They are logged in directly and redirected to the dashboard
- If the user is not registered:
  - They are directed to a 4-step onboarding process (skipping the Account step since OAuth handles authentication):
    1. Profile
    2. Affiliation
    3. Biobank Access
    4. Finish
  - After completion, they are logged in and can use OAuth for future logins

## Component Structure

The authentication system consists of these key components:

1. **AuthenticationGateway** - The main entry point for login, providing both standard and OAuth options
2. **onboarding_flow.tsx** - Contains the multi-step registration components:
   - `StandardRegistration` - 5-step flow for email/password users
   - `GoogleRegistration` - 4-step flow for Google OAuth users
   - `GitHubRegistration` - 4-step flow for GitHub OAuth users
3. **onboarding_page_container.tsx** - Provides consistent layout and styling for all authentication pages
4. **components/** - Reusable UI components used across the authentication system

## Implementation Notes

- The `signin_or_register.tsx` and `app_component.tsx` files have been removed as they've been replaced by the more cohesive `AuthenticationGateway` component.
- The `AuthenticationGateway` component uses the same `PageContainer` as the registration flow, ensuring consistent styling and proper background display.
- OAuth authentication is handled through Supabase's built-in providers, which simplifies the integration.
- The system maintains separate flows for standard and OAuth users while providing a unified visual experience.