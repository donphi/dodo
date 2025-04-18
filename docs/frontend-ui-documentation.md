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