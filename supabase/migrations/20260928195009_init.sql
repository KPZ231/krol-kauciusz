-- Król Kauciusz: schema startowy (profile, wpisy kaucji, ranking)
-- Zasada: klient NIGDY nie pisze bezpośrednio do deposits/profiles.id/profiles.created_at.
-- Jedyna droga zapisu ilości = RPC add_deposit (security definer, z limitem dziennym).

create type public.deposit_source as enum ('receipt', 'manual');
create type public.deposit_status as enum ('pending', 'verified', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nick text not null unique check (nick ~ '^[A-Za-z0-9_]{3,20}$'),
  goal_grosze integer not null default 5000 check (goal_grosze >= 0),
  created_at timestamptz not null default now()
);

create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source public.deposit_source not null,
  status public.deposit_status not null default 'pending',
  plastic integer not null default 0 check (plastic between 0 and 500),
  cans integer not null default 0 check (cans between 0 and 500),
  glass integer not null default 0 check (glass between 0 and 500),
  receipt_path text,
  created_at timestamptz not null default now(),
  constraint deposits_nonempty check (plastic + cans + glass > 0)
);

create index deposits_user_id_created_at_idx on public.deposits (user_id, created_at desc);

-- Profil tworzy się automatycznie przy rejestracji (auth.users), nick tymczasowy do zmiany w apce.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nick)
  values (new.id, 'gracz_' || substr(new.id::text, 1, 6));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Jedyny sposób dodania wpisu kaucji. Waliduje ownership, limit dzienny i receipt_path.
-- ponytail: limit dzienny 300 szt na sztywno, per-user/konfigurowalny gdy będzie potrzeba.
create function public.add_deposit(
  p_plastic integer,
  p_cans integer,
  p_glass integer,
  p_source public.deposit_source,
  p_receipt_path text default null
)
returns public.deposits
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_today_total integer;
  v_row public.deposits;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;

  if p_source = 'receipt' and (p_receipt_path is null or p_receipt_path not like v_uid::text || '/%') then
    raise exception 'receipt_path must be under uid folder';
  end if;

  select coalesce(sum(plastic + cans + glass), 0) into v_today_total
  from public.deposits
  where user_id = v_uid and created_at >= now() - interval '1 day';

  if v_today_total + p_plastic + p_cans + p_glass > 300 then
    raise exception 'daily limit exceeded';
  end if;

  insert into public.deposits (user_id, source, status, plastic, cans, glass, receipt_path)
  values (
    v_uid,
    p_source,
    case when p_source = 'manual' then 'verified' else 'pending' end,
    p_plastic,
    p_cans,
    p_glass,
    p_receipt_path
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.add_deposit to authenticated;

-- Ranking = tylko nick + suma zweryfikowanych sztuk, nic więcej z deposits nie wycieka.
create view public.leaderboard as
select p.nick, coalesce(sum(d.plastic + d.cans + d.glass), 0)::bigint as total_items
from public.profiles p
left join public.deposits d on d.user_id = p.id and d.status = 'verified'
group by p.nick
order by total_items desc;

alter table public.profiles enable row level security;
alter table public.deposits enable row level security;

create policy profiles_select_all on public.profiles for select to authenticated using (true);
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (nick, goal_grosze) on public.profiles to authenticated;

create policy deposits_select_own on public.deposits for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.deposits from authenticated;

grant select on public.leaderboard to authenticated, anon;

-- Storage: zdjęcia paragonów, prywatne, dostęp tylko właściciel przez folder <uid>/...
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);

create policy receipts_owner_rw on storage.objects for all to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
