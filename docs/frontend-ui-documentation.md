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

## Responsive Design and Width Management

### Width Tokens

The application uses centralized width tokens in the Tailwind configuration to ensure consistent sizing across components:

```js
// In tailwind.config.js
maxWidth: {
  'form': '480px',       // Default desktop width for forms
  'breadcrumbs': '440px', // Width for breadcrumbs component
},
```

These tokens should be used consistently across the application to maintain visual harmony and ensure that changes to component widths can be made in a single location.

### Component Width Guidelines

1. **Form Containers**: Use `sm:max-w-form` for form containers on desktop. On mobile, use `w-full` with appropriate padding.

2. **Breadcrumbs**: Use `sm:max-w-breadcrumbs` for the breadcrumbs component on desktop. On mobile, use a percentage-based width like `max-w-[95%]` to ensure it doesn't extend to the edges of the screen.

3. **Form Elements**: All form elements should use `w-full` to ensure they expand to fill their container.

### Responsive Design Pattern

The application follows a mobile-first approach:

1. Default styles are applied for mobile devices
2. `sm:` prefix is used for tablet and desktop styles (≥640px)
3. `lg:` prefix is used for larger desktop styles (≥1024px)

### Important Notes

- **Breadcrumbs and Form Width Relationship**: The breadcrumbs component and form containers have separate width tokens to prevent one from affecting the other. This allows for independent adjustment of their widths.

- **Mobile Padding**: On mobile devices, form containers should have appropriate horizontal padding (e.g., `px-4`) to prevent content from touching the edges of the screen.

- **Width Inheritance**: Be careful with nested components that might inherit width constraints from their parents. Use explicit width classes when necessary to override inherited constraints.