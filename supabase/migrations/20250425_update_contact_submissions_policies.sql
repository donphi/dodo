-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Only authenticated users can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service role can do everything" ON public.contact_submissions;

-- Create policy to allow only authenticated users to view submissions
CREATE POLICY "Only authenticated users can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow anyone to insert submissions
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can do everything"
  ON public.contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);