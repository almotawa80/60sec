-- استراحات الشركاء (9) + بطاقة الأختام. شغّله مرة وحدة.
-- كل استراحة سؤال واحد ومحاولة وحدة. 3 أختام من نفس الشريك = قسيمة الشريك تنضاف في r_redemptions تلقائياً.

alter table r_road add column if not exists rests jsonb not null default '{}'::jsonb;

create table if not exists r_rest_q(
  idx int primary key,            -- 0..8 (ترتيب الاستراحة على الطريق)
  at int not null,                -- تنفتح بعد ما يعدي هذا الفرع (pos > at)
  partner text not null,          -- arabica | pick | wooden
  q text not null,
  opts text[] not null,           -- 4 خيارات
  right_i int not null            -- رقم الخيار الصحيح 0..3
);
alter table r_rest_q enable row level security;

insert into r_rest_q(idx, at, partner, q, opts, right_i) values
 (0, 1,  'arabica', 'قهوة «% أرابيكا» علامة أصلها من أي دولة؟', array['إيطاليا','اليابان','البرازيل','تركيا'], 1),
 (1, 4,  'pick',    '«بيك» علامة أصلها من أي دولة؟', array['الكويت','السعودية','الإمارات','لبنان'], 0),
 (2, 7,  'wooden',  '«وودن بيكري» أصلها من أي دولة؟', array['الأردن','سوريا','لبنان','مصر'], 2),
 (3, 11, 'arabica', 'شعار «أرابيكا» عبارة عن أي رمز؟', array['#','&','@','%'], 3),
 (4, 14, 'pick',    '«بيك» معروفة بأي نوع من الأكل؟', array['الأكل الصحي','الحلويات الشرقية','المأكولات البحرية','الوجبات المقلية'], 0),
 (5, 17, 'wooden',  'تأسست «وودن بيكري» أول مرة في أي سنة؟', array['1985','1969','1999','2009'], 1),
 (6, 21, 'arabica', 'اشتهر أول فرع رئيسي لـ«أرابيكا» في أي مدينة يابانية؟', array['طوكيو','أوساكا','كيوتو','ناغويا'], 2),
 (7, 24, 'pick',    'أي من هذي الأصناف تقدمه «بيك»؟', array['بيتزا','سوشي','برغر لحم','وعاء أساي'], 3),
 (8, 27, 'wooden',  'أول دولة افتتحت فيها «وودن بيكري» فرع خارج لبنان؟', array['السعودية','الكويت','قطر','الإمارات'], 0)
on conflict (idx) do update set at=excluded.at, partner=excluded.partner, q=excluded.q, opts=excluded.opts, right_i=excluded.right_i;

create or replace function public.r_rest_stamps(p_rests jsonb, p_partner text) returns int
language sql stable set search_path to 'public' as $$
  select count(*)::int from r_rest_q q where q.partner = p_partner and (p_rests ->> q.idx::text) = '1';
$$;

-- يجيب سؤال الاستراحة (بدون الإجابة الصحيحة)
create or replace function public.r_rest_get(p_id uuid, p_idx int)
returns json language plpgsql security definer set search_path to 'public' as $$
declare rd r_road; q r_rest_q;
begin
  select * into q from r_rest_q where idx = p_idx;
  if not found then return json_build_object('ok', false, 'error', 'bad'); end if;
  select * into rd from r_road where player_id = p_id;
  if not found or rd.pos <= q.at then return json_build_object('ok', false, 'error', 'locked'); end if;
  if rd.rests ? p_idx::text then return json_build_object('ok', false, 'error', 'done', 'correct', (rd.rests ->> p_idx::text) = '1'); end if;
  return json_build_object('ok', true, 'partner', q.partner, 'q', q.q, 'opts', q.opts, 'stamps', r_rest_stamps(rd.rests, q.partner));
end $$;

-- يسجّل الإجابة (مرة وحدة) ويعطي القسيمة إذا اكتملت 3 أختام
create or replace function public.r_rest_answer(p_id uuid, p_idx int, p_choice int)
returns json language plpgsql security definer set search_path to 'public' as $$
declare rd r_road; q r_rest_q; ok boolean; st int; title text; code text; pl r_players;
  A text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  select * into q from r_rest_q where idx = p_idx;
  if not found then return json_build_object('ok', false, 'error', 'bad'); end if;
  select * into rd from r_road where player_id = p_id for update;
  if not found or rd.pos <= q.at then return json_build_object('ok', false, 'error', 'locked'); end if;
  if rd.rests ? p_idx::text then return json_build_object('ok', false, 'error', 'done'); end if;
  ok := coalesce(p_choice, -1) = q.right_i;
  rd.rests := rd.rests || jsonb_build_object(p_idx::text, case when ok then 1 else 0 end);
  update r_road set rests = rd.rests, updated_at = now() where player_id = p_id;
  st := r_rest_stamps(rd.rests, q.partner);
  if ok and st = 3 then
    title := case q.partner when 'arabica' then 'قسيمة أرابيكا ٥ د.ك' when 'pick' then 'قسيمة بيك ٥ د.ك' else 'قسيمة وودن بيكري ٥ د.ك' end;
    code := ''; for i in 1..8 loop code := code || substr(A, 1 + floor(random()*length(A))::int, 1); end loop;
    select * into pl from r_players where id = p_id;
    insert into r_redemptions(player_id, player_name, reward, cost, code, emp_no, status)
      values (p_id, left(coalesce(pl.name,''),60), title || ' (أختام)', 0, code, pl.emp_no, 'جديد');
    return json_build_object('ok', true, 'correct', true, 'right', q.right_i, 'stamps', st, 'voucher', json_build_object('title', title, 'code', code));
  end if;
  return json_build_object('ok', true, 'correct', ok, 'right', q.right_i, 'stamps', st);
end $$;

-- حالة الطريق ترجع الاستراحات بعد
CREATE OR REPLACE FUNCTION public.r_road_state(p_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare rd r_road; today date := (now() at time zone 'Asia/Kuwait')::date; st int; ah json; ahn int; arr int;
begin
  if not exists(select 1 from r_players where id = p_id) then return null; end if;
  insert into r_road(player_id) values (p_id) on conflict do nothing;
  select * into rd from r_road where player_id = p_id;
  st := case when rd.last_day >= today - 1 then rd.streak
             when rd.last_day = today - 2 and rd.shields > 0 then rd.streak else 0 end;
  select coalesce(json_agg(json_build_object('n', split_part(p.name,' ',1), 'pos', r.pos) order by r.pos, r.updated_at), '[]'::json)
    into ah from (select * from r_road r2 where r2.pos between rd.pos + 1 and rd.pos + 2 and r2.player_id <> p_id order by r2.pos limit 3) r
    join r_players p on p.id = r.player_id;
  select count(*) into ahn from r_road where pos > rd.pos;
  select count(*) into arr from r_road where arrived_at is not null;
  return json_build_object('pos', rd.pos, 'stars', rd.stars, 'streak', st, 'best_streak', rd.best_streak,
    'shields', rd.shields, 'keys', rd.keys, 'practice', rd.practice % 3, 'malls', rd.malls, 'mall_open', rd.mall_open,
    'today', rd.last_day = today, 'arrived', rd.arrived_at, 'rank', rd.arrive_rank,
    'ahead', ah, 'ahead_n', ahn, 'arrived_n', arr, 'rests', rd.rests);
end $function$;

grant execute on function public.r_rest_get(uuid,int), public.r_rest_answer(uuid,int,int) to anon, authenticated;
