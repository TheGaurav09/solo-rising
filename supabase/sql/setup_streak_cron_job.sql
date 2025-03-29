
-- Create a SQL function to schedule our update-streaks function to run daily
create or replace function public.setup_streak_cron_job()
returns void
language plpgsql
security definer
as $$
begin
  -- Make sure the required extensions are enabled
  create extension if not exists pg_cron;
  create extension if not exists pg_net;

  -- Schedule the job to run daily at midnight UTC
  select cron.schedule(
    'update-streaks-daily',  -- job name
    '0 0 * * *',            -- cron schedule (daily at midnight)
    $$
    select
      net.http_post(
        url:='https://xppaofqmxtaikkacvvzt.supabase.co/functions/v1/update-streaks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcGFvZnFteHRhaWtrYWN2dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTM0OTUsImV4cCI6MjA1NjcyOTQ5NX0.lI372EUlv0gCI8536_AbSd_kvSrsurZP7xx2DbyW7Dc"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );
end;
$$;
