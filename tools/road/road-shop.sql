-- متجر الحصريات (نسخة الطريق): محاربين وأسلحة تنشرى بالنقاط
-- آمن: يضيف جدول ودالتين بس، وما يحذف شي

create table if not exists r_shop_owned(
  player_id uuid not null,
  item text not null,
  cost integer not null default 0,
  at timestamptz not null default now(),
  primary key (player_id, item)
);
alter table r_shop_owned enable row level security;

-- الأسعار هنا هي المعتمدة (السيرفر ما يصدق السعر من اللعبة)
create or replace function r_shop_price(p_item text) returns integer language sql immutable as $$
  select case p_item
    when 'shemagh' then 800 when 'redhood' then 800 when 'goldguard' then 800 when 'silverwing' then 800
    when 'goldsword' then 400 when 'golddouble' then 400 when 'lightning' then 600 when 'flail' then 600
    else null end
$$;

create or replace function r_shop_owned(p_id uuid)
returns json language sql security definer set search_path to 'public' as $$
  select json_build_object('ok', true, 'items', coalesce((select json_agg(item order by at) from r_shop_owned where player_id = p_id), '[]'::json))
$$;

create or replace function r_shop_buy(p_id uuid, p_item text)
returns json language plpgsql security definer set search_path to 'public' as $$
declare pr integer := r_shop_price(p_item); bal integer;
begin
  if pr is null then return json_build_object('ok', false, 'error', 'item'); end if;
  select balance into bal from r_players where id = p_id for update;
  if not found then return json_build_object('ok', false, 'error', 'player'); end if;
  if exists(select 1 from r_shop_owned where player_id = p_id and item = p_item) then
    return json_build_object('ok', true, 'balance', bal, 'items', (r_shop_owned(p_id))->'items');
  end if;
  if coalesce(bal, 0) < pr then return json_build_object('ok', false, 'error', 'balance', 'balance', bal); end if;
  update r_players set balance = balance - pr where id = p_id returning balance into bal;
  insert into r_shop_owned(player_id, item, cost) values (p_id, p_item, pr);
  return json_build_object('ok', true, 'balance', bal, 'items', (r_shop_owned(p_id))->'items');
end $$;

grant execute on function r_shop_owned(uuid) to anon, authenticated;
grant execute on function r_shop_buy(uuid, text) to anon, authenticated;
