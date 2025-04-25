-- Create contact_submissions table
create table public.contact_submissions (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  message text not null,
  agreed_to_privacy boolean not null default false,
  created_at timestamp with time zone default now() not null
);

-- Add comment to the table
comment on table public.contact_submissions is 'Stores contact form submissions from the website';

-- Set up Row Level Security (RLS)
alter table public.contact_submissions enable row level security;

-- Create policy to allow only authenticated users to view submissions
create policy "Only authenticated users can view contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (true);

-- Create policy to allow anyone to insert submissions
create policy "Anyone can submit contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Create policy to allow service role to do everything
create policy "Service role can do everything"
  on public.contact_submissions
  for all
  to service_role
  using (true)
  with check (true);

-- Create index on email for potential future filtering
create index contact_submissions_email_idx on public.contact_submissions (email);

-- Create index on created_at for sorting and filtering by date
create index contact_submissions_created_at_idx on public.contact_submissions (created_at desc);