-- Create quotes table
create table if not exists quotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  items jsonb not null,
  total_price numeric not null,
  status text default 'pending', -- pending, contacted, closed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table quotes enable row level security;

-- Policies
create policy "Users can view their own quotes"
  on quotes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quotes"
  on quotes for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all quotes"
  on quotes for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can update quotes"
  on quotes for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
