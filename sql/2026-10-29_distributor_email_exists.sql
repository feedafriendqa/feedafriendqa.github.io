-- Lets the driver registration page ask whether an email already has a driver account (returns true/false only).
create or replace function public.distributor_email_exists(p_email text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.distributors where lower(email) = lower(trim(p_email)));
$$;
revoke all on function public.distributor_email_exists(text) from public;
grant execute on function public.distributor_email_exists(text) to anon, authenticated;
