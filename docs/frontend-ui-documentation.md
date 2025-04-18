# Frontend UI Documentation

## Dashboard Profile and Menu

The dashboard includes a user profile display and menu functionality that provides the following features:

### Profile Display
- Shows the user's profile picture if available from Supabase
- Falls back to displaying the user's initials in a colored avatar if no profile picture is available
- Displays the user's name and email in the mobile view

### Menu Functionality
- **Contact Us**: Navigates to the contact page using Next.js router
- **Logout**: Properly logs the user out of their Supabase session
- **Delete Account**: Securely deletes the user's profile and account data from Supabase

### Implementation Details

The profile and menu functionality is implemented in the `frontend/components/dashboard/single_page.tsx` component, which uses:

1. The `useAuth` hook (`frontend/hooks/useAuth.ts`) to:
   - Fetch and display the current user's profile information
   - Handle authentication state
   - Provide logout functionality
   - Securely delete user accounts

2. Supabase Edge Functions:
   - `delete-user.ts`: A serverless function that handles secure account deletion using Supabase admin privileges

### Required Environment Variables

For the profile and authentication features to work properly, the following environment variables must be set:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For the account deletion functionality to work in production, the Supabase Edge Function must be deployed with:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Usage Example

The profile menu is automatically included in the dashboard layout. No additional configuration is needed to use it.

```tsx
// Example of how the dashboard is used in pages
import Dashboard from '../components/dashboard/single_page';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
```

## Form Components and UI Fixes

### Radio Buttons
Radio buttons are implemented in `frontend/components/auth/components/radio.tsx` and provide standard form radio button functionality with proper styling for both light and dark modes.

#### Dark Mode Styling
Radio buttons use the following Tailwind classes to ensure proper appearance in dark mode:
- `dark:border-gray-600` - Darker border in dark mode
- `dark:text-indigo-500` - Adjusted text color for dark mode
- `dark:focus:ring-indigo-500` - Focus ring color for dark mode
- `dark:bg-gray-800` - Background color for dark mode
- `dark:checked:bg-indigo-500` - Background color when checked in dark mode
- `appearance-none checked:appearance-auto` - Controls native appearance when checked

### Error Messages
Error messages are displayed in a consistent, accessible manner across the application. On the registration page (`frontend/pages/register.tsx`), error messages are centered and properly styled for both light and dark modes:

```tsx
{error && (
  <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-6 mx-auto max-w-md">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
      </div>
    </div>
  </div>
)}
```

Key styling features:
- `mx-auto max-w-md` - Centers the error message with a maximum width
- `dark:bg-red-900` - Dark mode background color
- `dark:text-red-200` - Dark mode text color for better contrast and readability