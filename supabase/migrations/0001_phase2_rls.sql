-- Apply after the Prisma schema has been migrated to the Supabase Postgres database.
-- Prisma's current model names are quoted here intentionally.
alter table if exists "Profile" enable row level security;
alter table if exists "ProductAccess" enable row level security;
alter table if exists "Download" enable row level security;

drop policy if exists "profile owner read" on "Profile";
create policy "profile owner read" on "Profile" for select using ("userId" = auth.uid()::text);
drop policy if exists "profile owner update" on "Profile";
create policy "profile owner update" on "Profile" for update using ("userId" = auth.uid()::text);

drop policy if exists "access owner read" on "ProductAccess";
create policy "access owner read" on "ProductAccess" for select using ("userId" = auth.uid()::text);
drop policy if exists "download owner read" on "Download";
create policy "download owner read" on "Download" for select using ("userId" = auth.uid()::text);

-- Server-side Prisma operations run with the database connection role and remain
-- responsible for creating access/download records after authentication checks.
