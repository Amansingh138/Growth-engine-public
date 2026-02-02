# Database Setup Instructions

The automated database setup failed due to permission restrictions. Please manually run the following SQL code in your Supabase Dashboard to enable the "Library" features.

1.  Go to your **Supabase Dashboard**.
2.  Open the **SQL Editor** (from the left sidebar).
3.  Click **"New Query"**.
4.  **Paste** the code below and click **"Run"**.

```sql
-- Create Notebooks Table
create table if not exists public.notebooks (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null default auth.uid (),
  name text not null,
  description text null,
  constraint notebooks_pkey primary key (id),
  constraint notebooks_user_id_fkey foreign key (user_id) references auth.users (id) on update cascade on delete cascade
);

-- Create Sources Table
create table if not exists public.sources (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  notebook_id uuid not null,
  title text not null,
  type text not null check (type in ('url', 'text')), -- 'url' or 'text'
  content text not null, -- URL string or text body
  constraint sources_pkey primary key (id),
  constraint sources_notebook_id_fkey foreign key (notebook_id) references public.notebooks (id) on update cascade on delete cascade
);

-- RLS Policies (Security)
alter table public.notebooks enable row level security;
alter table public.sources enable row level security;

create policy "Users can view their own notebooks" on public.notebooks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notebooks" on public.notebooks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own notebooks" on public.notebooks
  for delete using (auth.uid() = user_id);

create policy "Users can view sources of their notebooks" on public.sources
  for select using (
    exists (
      select 1 from public.notebooks
      where notebooks.id = sources.notebook_id
      and notebooks.user_id = auth.uid()
    )
  );

create policy "Users can insert sources to their notebooks" on public.sources
  for insert with check (
    exists (
      select 1 from public.notebooks
      where notebooks.id = sources.notebook_id
      and notebooks.user_id = auth.uid()
    )
  );
```

After running this, the "Add Notebook" button will work!
