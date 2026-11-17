-- Run once: adds the "full reset" button function to the road admin panel. It touches the road version (r_ tables) only.
create or replace function public.r_admin_full_reset(p_key text, p_confirm text) returns json
language plpgsql security definer set search_path to 'public' as $$
begin
  if not r_admin_ok(p_key) then return json_build_object('ok', false, 'error', 'auth'); end if;
  if coalesce(p_confirm,'') <> 'تصفير' then return json_build_object('ok', false, 'error', 'confirm'); end if;
  delete from r_match_answers where true;
  delete from r_matches where true;
  delete from r_invites where true;
  delete from r_queue where true;
  delete from r_bonus_log where true;
  delete from r_game_log where true;
  delete from r_visits where true;
  delete from r_redemptions where true;
  delete from r_reg_events where true;
  delete from r_seen_questions where true;
  delete from r_road where true;
  delete from r_player_progress where true;
  update r_players set balance = 0, total_points = 0, points_day = null, played = 0, wins = 0, claim_open = false, playing_until = null where true;
  return json_build_object('ok', true);
end $$;
grant execute on function public.r_admin_full_reset(text,text) to anon, authenticated;
notify pgrst, 'reload schema';
