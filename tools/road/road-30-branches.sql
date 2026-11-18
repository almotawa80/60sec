-- الطريق: 30 فرع + الفرع الرئيسي (بدل 39)، و6 مولات (أضفنا الخيران مول)
-- آخر فرع (الرئيسي) = 30. صناديق نهاية المحافظات عند 5,9,13,18,23,30

CREATE OR REPLACE FUNCTION public.r_road_after2(p_id uuid, p_scored boolean, p_won boolean, p_quit boolean, p_score integer, p_draw boolean)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare rd r_road; today date := (now() at time zone 'Asia/Kuwait')::date; res jsonb := '{}'::jsonb;
  s int; old int; x float8; pts int := 0; sh int := 0; kind text; used_shield boolean := false;
begin
  insert into r_road(player_id) values (p_id) on conflict do nothing;
  select * into rd from r_road where player_id = p_id for update;
  if p_scored then
    if rd.last_day is distinct from today then
      if rd.last_day = today - 1 then rd.streak := rd.streak + 1;
      elsif rd.last_day = today - 2 and rd.shields > 0 then rd.shields := rd.shields - 1; rd.streak := rd.streak + 1; used_shield := true;
      else rd.streak := 1; end if;
      rd.last_day := today; rd.best_streak := greatest(rd.best_streak, rd.streak);
    end if;
    res := res || jsonb_build_object('streak', rd.streak, 'shield_used', used_shield);
    if rd.arrived_at is null and rd.pos <= 30 then
      s := case when coalesce(p_quit,false) then 0 when p_won then 3 when coalesce(p_draw,false) then 2 else 1 end;
      old := rd.pos;
      rd.stars[old + 1] := s;
      rd.pos := old + 1;
      if s > 0 then
        update r_players set balance = balance + s*10, total_points = total_points + s*10 where id = p_id;
      end if;
      res := res || jsonb_build_object('advanced', true, 'from', old, 'to', rd.pos, 'stars', s, 'star_pts', s*10,
        'result', case when coalesce(p_quit,false) then 'quit' when p_won then 'win' when coalesce(p_draw,false) then 'draw' else 'lose' end);
      if old = any(array[5,9,13,18,23,30]) then
        x := random();
        if x < 0.03 then kind := 'jackpot'; pts := 1500;
        elsif x < 0.25 then kind := 'shield'; pts := 50; sh := 1;
        elsif x < 0.55 then kind := 'big'; pts := 200;
        else kind := 'small'; pts := 100; end if;
        rd.shields := rd.shields + sh;
        update r_players set balance = balance + pts, total_points = total_points + pts where id = p_id;
        rd.chests := rd.chests || jsonb_build_array(jsonb_build_object('at', old, 'kind', kind, 'pts', pts, 'day', today));
        res := res || jsonb_build_object('chest', jsonb_build_object('kind', kind, 'pts', pts, 'shield', sh));
      end if;
      if old = 30 then
        rd.arrived_at := now();
        select count(*) + 1 into rd.arrive_rank from r_road where arrived_at is not null;
        res := res || jsonb_build_object('arrived', true, 'rank', rd.arrive_rank);
      end if;
    end if;
  elsif not coalesce(p_quit,false) or rd.mall_open is not null then
    if rd.mall_open is not null then
      if p_won and not coalesce(p_quit,false) then
        rd.malls := array_append(rd.malls, rd.mall_open); rd.shields := rd.shields + 1;
        update r_players set balance = balance + 100, total_points = total_points + 100 where id = p_id;
        res := res || jsonb_build_object('mall', jsonb_build_object('idx', rd.mall_open, 'won', true, 'pts', 100, 'shield', 1));
      else
        res := res || jsonb_build_object('mall', jsonb_build_object('idx', rd.mall_open, 'won', false));
      end if;
      rd.mall_open := null;
    else
      rd.practice := rd.practice + 1;
      if rd.practice % 3 = 0 and rd.keys < 5 then rd.keys := rd.keys + 1; res := res || jsonb_build_object('key', true); end if;
    end if;
  end if;
  update r_road set pos = rd.pos, stars = rd.stars, streak = rd.streak, best_streak = rd.best_streak, last_day = rd.last_day,
    shields = rd.shields, keys = rd.keys, practice = rd.practice, malls = rd.malls, mall_open = rd.mall_open, chests = rd.chests,
    arrived_at = rd.arrived_at, arrive_rank = rd.arrive_rank, updated_at = now()
  where player_id = p_id;
  return res::json;
end $function$;

-- المولات: ذا ويرهاوس، البيرق، أفنتورا، الأفنيوز، 360، الخيران (تنفتح بعد الفروع 2,5,9,18,23,0)
CREATE OR REPLACE FUNCTION public.r_mall_start(p_id uuid, p_mall integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare rd r_road; at_idx int[] := array[2,5,9,18,23,0];
begin
  if p_mall is null or p_mall < 0 or p_mall > 5 then return json_build_object('ok', false, 'error', 'bad'); end if;
  if not exists(select 1 from r_players where id = p_id) then return json_build_object('ok', false, 'error', 'bad'); end if;
  insert into r_road(player_id) values (p_id) on conflict do nothing;
  select * into rd from r_road where player_id = p_id for update;
  if p_mall = any(rd.malls) then return json_build_object('ok', false, 'error', 'done'); end if;
  if rd.pos <= at_idx[p_mall + 1] then return json_build_object('ok', false, 'error', 'locked'); end if;
  if rd.mall_open = p_mall then return json_build_object('ok', true, 'keys', rd.keys); end if;
  if rd.keys < 1 then return json_build_object('ok', false, 'error', 'nokey'); end if;
  update r_road set keys = keys - 1, mall_open = p_mall, updated_at = now() where player_id = p_id;
  return json_build_object('ok', true, 'keys', rd.keys - 1);
end $function$;

-- اللاعبين التجريبيين اللي تعدوا آخر فرع جديد يرجعون للفرع الرئيسي
update r_road set pos = 30 where pos > 30 and arrived_at is null;
