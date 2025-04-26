# Account Deletion Implementation

_Last updated: 2025-04-26_

This document outlines the implementation of the account deletion functionality, which allows users to permanently delete their accounts and all associated data from the system.

## Overview

The account deletion process involves several steps to ensure that all user data is properly removed from the system:

1. User initiates account deletion through the UI
2. Frontend confirms the deletion request
3. Backend deletes all user-related data from Supabase tables
4. Backend deletes the user's authentication record from Supabase Auth
5. User is redirected to the home page

## Components

### 1. Frontend UI Component (`delete.tsx`)

The `DeleteAccountDialog` component provides a confirmation dialog for users who want to delete their account. It includes:

- Clear warning about the permanent nature of account deletion
- Confirmation and cancellation buttons
- Loading state during the deletion process
- Error handling for failed deletion attempts

```typescript
// Usage example in a dashboard component:
import DeleteAccountDialog from '../components/delete';

function Dashboard() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowDeleteDialog(true)}>
        Delete Account
      </button>
      
      {showDeleteDialog && (
        <DeleteAccountDialog 
          isOpen={showDeleteDialog} 
          onClose={() => setShowDeleteDialog(false)} 
        />
      )}
    </>
  );
}
```

### 2. Authentication Hook (`useAuth.ts`)

The `useAuth` hook includes a `deleteAccount` function that handles the deletion of user data from Supabase tables and calls the API to delete the user's authentication record:

```typescript
const deleteAccount = async () => {
  // Delete user sessions
  await supabase.from('user_sessions').delete().eq('user_id', user.id);
  
  // Delete survey responses
  await supabase.from('survey_responses').delete().eq('user_id', user.id);
  
  // Delete user profile
  await supabase.from('profiles').delete().eq('id', user.id);
  
  // Call API to delete auth record
  await fetch('/api/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id }),
  });
  
  // Sign out and redirect
  await signOut();
};
```

### 3. API Endpoint (`/api/delete-user.ts`)

The API endpoint uses the Supabase service role key to delete the user's authentication record and any remaining data:

```typescript
// Delete user data from all tables
await supabase.from('user_sessions').delete().eq('user_id', user_id);
await supabase.from('survey_responses').delete().eq('user_id', user_id);
await supabase.from('profiles').delete().eq('id', user_id);

// Delete auth record
await supabase.auth.admin.deleteUser(user_id, {
  shouldSoftDelete: false
});
```

### 4. Supabase Function (`functions/delete-user.ts`)

A backup function that performs the same deletion operations as the API endpoint, ensuring that all user data is properly deleted even if the client-side deletion fails.

## Security Considerations

1. **Authorization**: Only authenticated users can delete their own accounts.
2. **Service Role Key**: The API endpoint uses the Supabase service role key to delete the user's authentication record, which requires proper environment variable configuration.
3. **Complete Deletion**: The `shouldSoftDelete: false` option ensures that the user is completely removed from Supabase Auth, preventing them from logging in with the same email in the future.

## Testing

To test the account deletion functionality:

1. Create a test user account
2. Add some data to the user's profile and other tables
3. Initiate account deletion through the UI
4. Verify that all user data has been deleted from all tables
5. Attempt to log in with the deleted user's credentials (should fail)
6. Attempt to create a new account with the same email (should succeed if `shouldSoftDelete: false` is working correctly)

## Future Improvements

1. Add a "cooling-off period" before permanent deletion
2. Implement data export functionality to allow users to download their data before deletion
3. Add admin-initiated account deletion functionality
4. Implement more detailed logging of account deletion events for audit purposes