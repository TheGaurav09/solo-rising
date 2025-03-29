
-- Function to safely increment user points
create or replace function public.increment_points(user_id uuid, amount integer)
returns integer
language plpgsql
security definer
as $$
declare
  current_points integer;
begin
  -- Get current points
  select points into current_points from public.users where id = user_id;
  
  -- Return new value
  return coalesce(current_points, 0) + amount;
end;
$$;
