-- تقرير نقاط القوة والضعف (نسخة الطريق)
-- 1) يحفظ كل إجابة (ضد البوت أو لاعب حقيقي)  2) هيكل الموظف: المجموعة / الإدارة / قسم-فرع-وحدة  3) دوال التقرير للوحة التحكم
-- آمن: ما يحذف شي، بس يضيف جدول وأعمدة ودوال

create table if not exists r_answer_log(
  id bigserial primary key,
  player_id uuid not null,
  question_id bigint not null,
  ok boolean not null,
  ms integer,
  pick text,
  human boolean not null default false,
  at timestamptz not null default now()
);
create index if not exists r_answer_log_p on r_answer_log(player_id, at desc);
create index if not exists r_answer_log_q on r_answer_log(question_id);
create index if not exists r_answer_log_at on r_answer_log(at);
alter table r_answer_log enable row level security;

alter table r_employees add column if not exists grp text;
alter table r_employees add column if not exists unit_type text;
alter table r_employees add column if not exists unit text;

-- اللعبة ترسل إجابات الجولة بعد نهايتها. نقبل فقط أسئلة انعرضت على اللاعب خلال آخر ساعتين، وما نكرر نفس السؤال خلال ٣٠ دقيقة
create or replace function r_log_answers(p_id uuid, p_items json, p_human boolean default false)
returns json language plpgsql security definer set search_path to 'public' as $$
declare x json; q bigint; n int := 0;
begin
  if p_id is null or not exists(select 1 from r_players where id = p_id) then return json_build_object('ok', false); end if;
  if json_typeof(p_items) <> 'array' then return json_build_object('ok', false); end if;
  for x in select * from json_array_elements(p_items) limit 8 loop
    begin q := (x->>'q')::bigint; exception when others then continue; end;
    if q is null then continue; end if;
    if not exists(select 1 from r_seen_questions s where s.player_id = p_id and s.question_id = q and s.seen_at > now() - interval '2 hours') then continue; end if;
    if exists(select 1 from r_answer_log a where a.player_id = p_id and a.question_id = q and a.at > now() - interval '30 minutes') then continue; end if;
    insert into r_answer_log(player_id, question_id, ok, ms, pick, human)
      values (p_id, q, coalesce((x->>'ok')::boolean, false), least(greatest(coalesce((x->>'ms')::int, 0), 0), 60000), left(x->>'pick', 120), coalesce(p_human, false));
    n := n + 1;
  end loop;
  return json_build_object('ok', true, 'n', n);
end $$;

-- تقرير موظف واحد
create or replace function r_admin_player_report(p_key text, p_emp text, p_days int default 30)
returns json language plpgsql security definer set search_path to 'public' as $$
declare pid uuid; since timestamptz;
begin
  if not r_admin_ok(p_key) then return json_build_object('ok', false, 'error', 'auth'); end if;
  select id into pid from r_players where emp_no = p_emp limit 1;
  if pid is null then return json_build_object('ok', false, 'error', 'nf'); end if;
  since := case when coalesce(p_days, 0) > 0 then now() - make_interval(days => p_days) else '-infinity'::timestamptz end;
  return json_build_object('ok', true,
    'emp', (select json_build_object('grp', e.grp, 'dept', e.dept, 'unit_type', e.unit_type, 'unit', e.unit) from r_employees e where e.emp_no = p_emp),
    'tot', (select json_build_object('n', count(*), 'ok', count(*) filter (where a.ok), 'ms', round(avg(a.ms) filter (where a.ok))) from r_answer_log a where a.player_id = pid and a.at >= since),
    'cats', coalesce((select json_agg(t order by t.n desc) from (
        select q.cat, count(*) n, count(*) filter (where a.ok) ok,
          (select round(100.0 * count(*) filter (where b.ok) / nullif(count(*), 0)) from r_answer_log b join questions qb on qb.id = b.question_id where qb.cat = q.cat and b.at >= since) bank
        from r_answer_log a join questions q on q.id = a.question_id where a.player_id = pid and a.at >= since group by q.cat) t), '[]'::json),
    'wrong', coalesce((select json_agg(t) from (
        select q.cat, q.q, q.right_ans, a.pick, a.at from r_answer_log a join questions q on q.id = a.question_id
        where a.player_id = pid and not a.ok and a.at >= since order by a.at desc limit 10) t), '[]'::json));
end $$;

-- تقرير البنك: فلترة بالمجموعة / الإدارة / الوحدة
create or replace function r_admin_bank_report(p_key text, p_days int default 30, p_grp text default '', p_dept text default '', p_unit text default '', p_cat text default '')
returns json language plpgsql security definer set search_path to 'public' as $$
declare since timestamptz; g text := coalesce(p_grp, ''); d text := coalesce(p_dept, ''); u text := coalesce(p_unit, ''); c text := coalesce(p_cat, '');
begin
  if not r_admin_ok(p_key) then return json_build_object('ok', false, 'error', 'auth'); end if;
  since := case when coalesce(p_days, 0) > 0 then now() - make_interval(days => p_days) else '-infinity'::timestamptz end;
  return (with b as (
      select a.ok, a.ms, a.question_id, a.player_id, q.cat, q.q, q.right_ans, e.grp, e.dept, e.unit_type, e.unit
      from r_answer_log a join questions q on q.id = a.question_id
      join r_players p on p.id = a.player_id left join r_employees e on e.emp_no = p.emp_no
      where a.at >= since and (g = '' or e.grp = g) and (d = '' or e.dept = d) and (u = '' or e.unit = u))
    select json_build_object('ok', true,
      'tot', (select json_build_object('n', count(*), 'ok', count(*) filter (where ok), 'players', count(distinct player_id)) from b),
      'cats', coalesce((select json_agg(t order by t.n desc) from (select cat, count(*) n, count(*) filter (where ok) ok from b group by cat) t), '[]'::json),
      'hard', coalesce((select json_agg(t) from (
          select cat, q, right_ans, count(*) n, count(distinct player_id) players, count(*) filter (where not ok) bad from b
          where c = '' or cat = c
          group by question_id, cat, q, right_ans having count(*) >= 3
          order by 1.0 * count(*) filter (where not ok) / count(*) desc, count(*) desc limit 10) t), '[]'::json),
      'units', coalesce((select json_agg(t order by t.pct desc) from (
          select case when d <> '' or u <> '' then coalesce(nullif(trim(coalesce(unit_type,'') || ' ' || coalesce(unit,'')), ''), 'تابع للإدارة')
                      when g <> '' then coalesce(dept, 'بدون إدارة') else coalesce(grp, 'بدون مجموعة') end k,
                 count(*) n, round(100.0 * count(*) filter (where ok) / count(*)) pct, count(distinct player_id) players
          from b where c = '' or cat = c group by 1) t), '[]'::json),
      'opts', json_build_object(
          'grp', coalesce((select json_agg(distinct grp) from r_employees where grp is not null), '[]'::json),
          'dept', coalesce((select json_agg(distinct dept) from r_employees where dept is not null and (g = '' or grp = g)), '[]'::json),
          'unit', coalesce((select json_agg(distinct unit) from r_employees where unit is not null and (g = '' or grp = g) and (d = '' or dept = d)), '[]'::json)))
    );
end $$;

-- تصدير Excel: كل موظف × كل تصنيف
create or replace function r_admin_report_export(p_key text, p_days int default 30)
returns json language plpgsql security definer set search_path to 'public' as $$
declare since timestamptz;
begin
  if not r_admin_ok(p_key) then return json_build_object('ok', false); end if;
  since := case when coalesce(p_days, 0) > 0 then now() - make_interval(days => p_days) else '-infinity'::timestamptz end;
  return json_build_object('ok', true, 'rows', coalesce((select json_agg(t) from (
    select p.emp_no, p.name, e.grp, e.dept, e.unit_type, e.unit, q.cat, count(*) n, count(*) filter (where a.ok) ok
    from r_answer_log a join questions q on q.id = a.question_id join r_players p on p.id = a.player_id left join r_employees e on e.emp_no = p.emp_no
    where a.at >= since group by p.emp_no, p.name, e.grp, e.dept, e.unit_type, e.unit, q.cat order by p.emp_no, q.cat) t), '[]'::json));
end $$;

-- رفع الموظفين مع الهيكل (نسخة جديدة، القديمة تبقى)
create or replace function r_admin_upload_employees2(p_key text, p_rows json)
returns json language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare x json; e text; nm text; ph text; dp text; gp text; ut text; un text; added int := 0; updated int := 0; skipped int := 0; codes json[] := '{}'; c text; s text;
begin
  if not r_admin_ok(p_key) then return json_build_object('ok', false, 'error', 'auth'); end if;
  for x in select * from json_array_elements(p_rows) loop
    e := translate(trim(coalesce(x->>'emp','')),'٠١٢٣٤٥٦٧٨٩ ','0123456789');
    nm := left(trim(coalesce(x->>'name','')), 60);
    ph := left(regexp_replace(coalesce(x->>'phone',''), '[^0-9]', '', 'g'), 15);
    dp := left(regexp_replace(trim(coalesce(x->>'dept','')), '\s+', ' ', 'g'), 60);
    gp := left(regexp_replace(trim(coalesce(x->>'grp','')), '\s+', ' ', 'g'), 60);
    ut := case when trim(coalesce(x->>'utype','')) in ('قسم','فرع','وحدة') then trim(x->>'utype') else '' end;
    un := left(regexp_replace(trim(coalesce(x->>'unit','')), '\s+', ' ', 'g'), 60);
    if e !~ '^[0-9]{1,10}$' or length(nm) < 2 then skipped := skipped + 1; continue; end if;
    if exists(select 1 from r_employees where emp_no = e) then
      update r_employees set name = nm, phone = coalesce(nullif(ph,''), phone), dept = coalesce(nullif(dp,''), dept),
        grp = coalesce(nullif(gp,''), grp), unit_type = coalesce(nullif(ut,''), unit_type), unit = coalesce(nullif(un,''), unit) where emp_no = e;
      updated := updated + 1;
    else
      c := r__emp_code(); s := replace(gen_random_uuid()::text,'-','');
      insert into r_employees(emp_no, name, phone, dept, grp, unit_type, unit, salt, code_hash, code_enc)
        values (e, nm, nullif(ph,''), nullif(dp,''), nullif(gp,''), nullif(ut,''), nullif(un,''), s, r__emp_hash(s, c), extensions.pgp_sym_encrypt(c, p_key));
      added := added + 1; codes := codes || json_build_object('emp', e, 'name', nm, 'phone', nullif(ph,''), 'code', c);
    end if;
  end loop;
  return json_build_object('ok', true, 'added', added, 'updated', updated, 'skipped', skipped, 'codes', array_to_json(codes));
end $$;

grant execute on function r_log_answers(uuid, json, boolean) to anon, authenticated;
grant execute on function r_admin_player_report(text, text, int) to anon, authenticated;
grant execute on function r_admin_bank_report(text, int, text, text, text, text) to anon, authenticated;
grant execute on function r_admin_report_export(text, int) to anon, authenticated;
grant execute on function r_admin_upload_employees2(text, json) to anon, authenticated;
