-- Per-child diaper size / formula on the reapply form.
-- Additive only: two new functions, nothing existing is changed.

-- 1) Children the reapply form should ask about (diapers: under 4, formula: under 12 months)
create or replace function public.get_reapply_children(p_application_id uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'member_id', m.id,
      'name', split_part(btrim(coalesce(nullif(btrim(m.full_name_en), ''), m.full_name, '')), ' ', 1),
      'dob', m.dob,
      'diaper_eligible', m.dob > (current_date - interval '4 years')::date,
      'formula_eligible', m.dob > (current_date - interval '12 months')::date,
      'diaper_size', m.diaper_size,
      'needs_formula', m.needs_formula
    ) order by m.dob desc), '[]'::jsonb)
  from food_box_members m
  where m.application_id = p_application_id
    and m.dob is not null
    and m.dob > (current_date - interval '4 years')::date;
$$;

-- 2) Save answers on the child's own member row.
-- Refuses (saves nothing) unless the application is eligible AND the reapply window is open.
-- p_children: [{"member_id": "...", "diaper_size": "M (Size 2)" | "Not needed" | null, "formula": true|false|null}]
create or replace function public.save_reapply_extras(
  p_application_id uuid,
  p_children jsonb default '[]'::jsonb,
  p_set_pregnancy boolean default false,
  p_is_pregnant boolean default null,
  p_due_date date default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  rec record;
  w jsonb;
  c jsonb;
  mem record;
  sz text;
  fm text;
  best_label text;
  any_formula boolean := false;
  all_no boolean := true;
  any_diaper_answer boolean := false;
begin
  select * into rec from food_box_applications where id = p_application_id;
  if rec.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if not (rec.status in ('approved','long_term') or rec.is_long_term is true) then
    return jsonb_build_object('ok', false, 'error', 'not_eligible');
  end if;
  w := reapply_window_state();
  if (w->>'closed')::boolean then
    return jsonb_build_object('ok', false, 'error', 'cutoff_passed', 'next_distribution', w->>'next_distribution');
  end if;

  for c in select * from jsonb_array_elements(coalesce(p_children, '[]'::jsonb)) loop
    select * into mem from food_box_members
     where id = (c->>'member_id')::uuid and application_id = p_application_id;
    if mem.id is null then continue; end if;

    if c ? 'diaper_size' and mem.dob > (current_date - interval '4 years')::date then
      sz := c->>'diaper_size';
      if sz is not null then
        any_diaper_answer := true;
        update food_box_members set diaper_size = case sz
            when 'NB (Newborn)' then 'Newborn'
            when 'S (Size 1)'   then '1'
            when 'M (Size 2)'   then '2'
            when 'L (Size 3)'   then '3'
            when 'XL (Size 4)'  then '4'
            when 'XXL (Size 5)' then '5'
            when 'Not needed'   then 'Not needed'
            else mem.diaper_size end
         where id = mem.id;
        if sz <> 'Not needed' then
          all_no := false;
          -- youngest child first in the loop order the caller sends; keep the first real size as summary
          if best_label is null then best_label := sz; end if;
        end if;
      end if;
    end if;

    if c ? 'formula' and mem.dob > (current_date - interval '12 months')::date
       and jsonb_typeof(c->'formula') = 'boolean' then
      fm := case when (c->>'formula')::boolean then 'yes' else 'no' end;
      update food_box_members set needs_formula = fm where id = mem.id;
      if fm = 'yes' then any_formula := true; end if;
    end if;
  end loop;

  -- Keep the family-level summary fields in step (other pages still read them);
  -- the per-child rows are the source of truth.
  if any_diaper_answer then
    update food_box_applications
       set diaper_size = case when all_no then 'Not needed' else best_label end, updated_at = now()
     where id = p_application_id;
  end if;
  if exists (select 1 from jsonb_array_elements(coalesce(p_children,'[]'::jsonb)) x where jsonb_typeof(x->'formula') = 'boolean') then
    update food_box_applications
       set formula = case when any_formula then 'Yes' else 'Not needed' end, updated_at = now()
     where id = p_application_id;
  end if;

  if p_set_pregnancy then
    update food_box_applications
       set is_pregnant = p_is_pregnant, due_date = case when p_is_pregnant then p_due_date else null end, updated_at = now()
     where id = p_application_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.get_reapply_children(uuid) to anon, authenticated;
grant execute on function public.save_reapply_extras(uuid, jsonb, boolean, boolean, date) to anon, authenticated;
