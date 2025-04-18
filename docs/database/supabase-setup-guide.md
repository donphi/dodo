# Supabase Setup Guide: Authentication, Profiles & Activity Tracking

This document outlines the necessary Supabase configuration steps to support user authentication (Email/Password, Google, GitHub), onboarding flow, storing user profile data, and basic user activity tracking. It includes step-by-step instructions for using the Supabase UI where applicable.

## 1. Authentication

This section details the configuration required within your Supabase project to enable user authentication.

### 1.1. Providers to Enable (Supabase UI Steps):

1.  Navigate to your Supabase project dashboard.
2.  In the left sidebar, click on the **Authentication** icon (looks like a shield).
3.  Under **Configuration**, select **Providers**.
4.  Enable the following providers by toggling them on:
    *   **Email**
    *   **Google**
    *   **GitHub**
5.  For **Google** and **GitHub**, you will need to:
    *   Obtain the **Client ID** and **Client Secret** from the respective developer consoles (Google Cloud Platform, GitHub Developer Settings).
    *   Enter these credentials into the corresponding fields in the Supabase provider settings.
    *   Ensure the **Redirect URL** provided by Supabase (e.g., `[YOUR_SUPABASE_URL]/auth/v1/callback`) is added to the allowed callback/redirect URIs in the Google/GitHub application settings.
    *   Click **Save** for each provider after entering the details.

### 1.2. Required Environment Variables:

Ensure the following environment variables are set in your application environment (e.g., `.env` file, Vercel environment variables). You can find the Supabase URL and keys in your Supabase project settings (**Project Settings** > **API**).

```bash
# Supabase Core
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key" # Required for server-side operations like triggers/functions

# Google OAuth (Obtained from Google Cloud Console)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub OAuth (Obtained from GitHub Developer Settings)
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

## 2. Database Schema: `profiles` Table

This table stores additional user information.

### 2.1. Purpose:

To hold user-specific profile data and track the last seen time.

### 2.2. SQL Definition:

This SQL script creates the `profiles` table, adds comments, and enables Row Level Security (RLS).

```sql
-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "fullName" text,
  email text, -- Consider if needed, as auth.users.email exists
  role text,
  experience text,
  country text,
  institution text,
  sector text,
  expertise text[], -- Array of text for multiple selections
  "ukBiobank" text,
  "otherBiobanks" text[], -- Array of text for multiple selections
  ethics text,
  avatar_url text, -- Stores URL from OAuth or path in Supabase Storage
  last_seen_at timestamptz NULL, -- Tracks when the user was last active
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add comments to columns for clarity
COMMENT ON COLUMN public.profiles.id IS 'References the user ID from auth.users table.';
COMMENT ON COLUMN public.profiles.email IS 'User email, potentially redundant with auth.users.email.';
COMMENT ON COLUMN public.profiles.expertise IS 'Array of user expertise areas.';
COMMENT ON COLUMN public.profiles.otherBiobanks IS 'Array of other biobanks the user works with.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user avatar, either from OAuth provider or Supabase Storage.';
COMMENT ON COLUMN public.profiles.last_seen_at IS 'Timestamp of the last recorded user activity.';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of the last profile update.';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp of the profile creation.';

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 2.3. Supabase UI Steps (SQL Editor):

1.  Navigate to your Supabase project dashboard.
2.  In the left sidebar, click on the **SQL Editor** icon (looks like a database symbol with 'SQL').
3.  Click **+ New query**.
4.  Copy the entire SQL script from **Section 2.2** above.
5.  Paste the script into the SQL Editor window.
6.  Click the **Run** button (usually green).
7.  You should see a "Success. No rows returned" message if the script executed correctly. The `profiles` table is now created, commented, and has RLS enabled.

**Note:** The `last_seen_at` column should be updated by your application logic.

### 2.4. Columns:

(Table definition remains the same as before)

| Column          | Data Type     | Constraints/Notes                                      |
| :-------------- | :------------ | :----------------------------------------------------- |
| `id`            | `uuid`        | Primary Key, Foreign Key referencing `auth.users(id)` |
| `fullName`      | `text`        |                                                        |
| `email`         | `text`        | Potentially redundant with `auth.users.email`          |
| `role`          | `text`        |                                                        |
| `experience`    | `text`        |                                                        |
| `country`       | `text`        |                                                        |
| `institution`   | `text`        |                                                        |
| `sector`        | `text`        |                                                        |
| `expertise`     | `text[]`      | Array for multiple values                        |
| `ukBiobank`     | `text`        |                                                        |
| `otherBiobanks` | `text[]`      | Array for multiple values                        |
| `ethics`        | `text`        |                                                        |
| `avatar_url`    | `text`        | Nullable. Stores OAuth URL or Storage path.            |
| `last_seen_at`  | `timestamptz` | Nullable. Updated on user activity.                    |
| `updated_at`    | `timestamptz` | Defaults to current timestamp                          |
| `created_at`    | `timestamptz` | Defaults to current timestamp                          |


## 3. Database Schema: `user_sessions` Table

This table logs individual user login events.

### 3.1. Purpose:

To record each successful login attempt.

### 3.2. SQL Definition:

This SQL script creates the `user_sessions` table, adds comments, creates an index, and enables RLS.

```sql
-- Create the user_sessions table
CREATE TABLE public.user_sessions (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arrival_time timestamptz NOT NULL DEFAULT now(),
  ip_address inet NULL -- Use inet type for IP addresses
);

-- Add comments for clarity
COMMENT ON TABLE public.user_sessions IS 'Logs individual user login sessions.';
COMMENT ON COLUMN public.user_sessions.id IS 'Unique identifier for the session record.';
COMMENT ON COLUMN public.user_sessions.user_id IS 'References the logged-in user in auth.users.';
COMMENT ON COLUMN public.user_sessions.arrival_time IS 'Timestamp when the session began (login time).';
COMMENT ON COLUMN public.user_sessions.ip_address IS 'IP address of the user at the time of login (if available).';

-- Optional: Index on user_id for faster lookups
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
```

### 3.3. Supabase UI Steps (SQL Editor):

1.  Navigate to the **SQL Editor** in your Supabase dashboard.
2.  Click **+ New query**.
3.  Copy the entire SQL script from **Section 3.2** above.
4.  Paste the script into the SQL Editor window.
5.  Click the **Run** button.
6.  You should see a "Success. No rows returned" message. The `user_sessions` table is now created with RLS enabled.

**Note:** Inserting rows into this table requires backend logic.

### 3.4. Columns:

(Table definition remains the same as before)

| Column       | Data Type     | Constraints/Notes                                      |
| :----------- | :------------ | :----------------------------------------------------- |
| `id`         | `uuid`        | Primary Key, Default `gen_random_uuid()`               |
| `user_id`    | `uuid`        | Not Nullable, Foreign Key referencing `auth.users(id)` |
| `arrival_time`| `timestamptz` | Not Nullable, Default `now()`                          |
| `ip_address` | `inet`        | Nullable. Stores the user's IP address.                |

## 4. Storage (Avatars)

Supabase Storage can host user-uploaded avatars.

### 4.1. Supabase UI Steps (Storage):

1.  Navigate to your Supabase project dashboard.
2.  In the left sidebar, click on the **Storage** icon (looks like a bucket).
3.  Click the **Create bucket** button.
4.  Enter `avatars` as the **Bucket name**.
5.  Decide if the bucket should be **Public** or **Private**. For profile pictures, **Public** is often simpler. If you choose Private, you'll need to generate signed URLs in your application to grant access.
6.  Click **Create bucket**.

### 4.2. Basic RLS Policies for `avatars` Bucket (SQL):

These policies control who can upload, update, and delete files in the `avatars` bucket.

```sql
-- Policy: Allow logged-in users to upload avatars
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy: Allow users to update their own avatar (matching user ID in path)
-- Assumes avatar path includes user ID, e.g., 'public/avatars/user-id/avatar.png'
CREATE POLICY "Allow own avatar update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid) -- Check bucket and user ID in path
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid); -- Enforce on update

-- Policy: Allow users to delete their own avatar
CREATE POLICY "Allow own avatar delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid); -- Check bucket and user ID in path

-- Policy: Allow public read access (IF BUCKET IS PUBLIC)
-- No specific policy needed if the bucket is marked as Public in Supabase UI.
-- If bucket is private, you'd need a SELECT policy potentially using signed URLs.
-- Example for authenticated read if private:
-- CREATE POLICY "Allow authenticated read access"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'avatars');
```

### 4.3. Supabase UI Steps (SQL Editor for Storage Policies):

1.  Navigate to the **SQL Editor**.
2.  Click **+ New query**.
3.  Copy the relevant `CREATE POLICY` statements from **Section 4.2** above (adjust based on your public/private choice and path structure).
4.  Paste the script(s) into the SQL Editor window.
5.  Click **Run**. Repeat for each policy you want to create.

### 4.4. Alternative: OAuth Provider Avatar URL

You can store the avatar URL provided by Google/GitHub directly in `profiles.avatar_url` instead of using Supabase Storage.

## 5. Row Level Security (RLS) for `profiles` Table

RLS ensures users only access their own profile data. RLS was enabled in Section 2. Now, we define the access rules (policies).

### 5.1. Example Policies (SQL):

```sql
-- Policy: Allow users to select their own profile
CREATE POLICY "Allow individual select access"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow individual update access"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to delete their own profile (Optional - consider if needed)
-- CREATE POLICY "Allow individual delete access"
-- ON public.profiles FOR DELETE
-- USING (auth.uid() = id);
```

### 5.2. Supabase UI Steps (Authentication Policies):

1.  Navigate to the **Authentication** section (shield icon).
2.  Under **Configuration**, select **Policies**.
3.  In the search bar, type `profiles` to filter, or find the `profiles` table in the list.
4.  Click on the `profiles` table row. RLS should show as "Enabled".
5.  Click **+ New Policy**.
6.  Choose **Create a new policy from scratch**.
7.  **For the "Allow individual select access" policy:**
    *   **Policy name:** `Allow individual select access`
    *   **Allowed operation:** `SELECT`
    *   **Target roles:** `authenticated`
    *   **USING expression:** `auth.uid() = id`
    *   Leave **WITH CHECK expression** blank.
    *   Click **Review** and then **Save policy**.
8.  Click **+ New Policy** again.
9.  Choose **Create a new policy from scratch**.
10. **For the "Allow individual update access" policy:**
    *   **Policy name:** `Allow individual update access`
    *   **Allowed operation:** `UPDATE`
    *   **Target roles:** `authenticated`
    *   **USING expression:** `auth.uid() = id`
    *   **WITH CHECK expression:** `auth.uid() = id`
    *   Click **Review** and then **Save policy**.
11. (Optional) Repeat for the DELETE policy if needed.

## 6. Row Level Security (RLS) for `user_sessions` Table

Control access to login history. RLS was enabled in Section 3. Now, define the policies.

### 6.1. Example Policies (SQL):

```sql
-- Policy: Allow users to select their own session records
CREATE POLICY "Allow individual user read access"
ON public.user_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Disallow direct modification from client-side by default
-- Assumes inserts are handled by trusted backend/functions
CREATE POLICY "Disallow public modification"
ON public.user_sessions FOR ALL -- Covers INSERT, UPDATE, DELETE
USING (false); -- Denies access unless overridden
```

### 6.2. Supabase UI Steps (Authentication Policies):

1.  Navigate to **Authentication** > **Policies**.
2.  Find or search for the `user_sessions` table.
3.  Click on the `user_sessions` table row. RLS should be "Enabled".
4.  Click **+ New Policy**.
5.  Choose **Create a new policy from scratch**.
6.  **For the "Allow individual user read access" policy:**
    *   **Policy name:** `Allow individual user read access`
    *   **Allowed operation:** `SELECT`
    *   **Target roles:** `authenticated`
    *   **USING expression:** `auth.uid() = user_id`
    *   Click **Review** and **Save policy**.
7.  Click **+ New Policy** again.
8.  Choose **Create a new policy from scratch**.
9.  **For the "Disallow public modification" policy:**
    *   **Policy name:** `Disallow public modification`
    *   **Allowed operation:** `ALL`
    *   **Target roles:** `public` (or `authenticated` depending on desired scope)
    *   **USING expression:** `false`
    *   Click **Review** and **Save policy**.

**Note:** The "Disallow public modification" policy is restrictive. Inserts should ideally be performed server-side.

### 6.3. Session Counting:

To count sessions for the current user (respecting RLS):

```sql
SELECT count(*)
FROM public.user_sessions
WHERE user_id = auth.uid();
```
This query can be run from your application's client-side code using the Supabase JS library.

## 7. Database Functions/Triggers (Recommended)

Automatically create a profile entry when a new user signs up in `auth.users`.

### 7.1. Trigger Function (SQL):

```sql
-- Function to create a profile entry for a new user
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to run with elevated privileges
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url' -- Attempt to grab avatar from OAuth provider metadata
  );
  RETURN NEW;
END;
$$;
```

### 7.2. Trigger Definition (SQL):

```sql
-- Trigger to call the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_profile_for_new_user();
```

### 7.3. Supabase UI Steps (SQL Editor for Function & Trigger):

1.  Navigate to the **SQL Editor**.
2.  Click **+ New query**.
3.  Copy the `CREATE OR REPLACE FUNCTION` script from **Section 7.1**.
4.  Paste it into the editor and click **Run**. You should see a success message.
5.  Click **+ New query** again.
6.  Copy the `CREATE TRIGGER` script from **Section 7.2**.
7.  Paste it into the editor and click **Run**. You should see a success message.

**Note:** The `SECURITY DEFINER` clause is important here. This setup automatically creates a basic profile row whenever a new user signs up via any authentication method.