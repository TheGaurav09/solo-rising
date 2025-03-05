
// This file contains RPC functions for the Supabase database
// Do not call these functions directly from your code, import this file from where needed

// This is just for reference - these functions need to be created on the Supabase side

/*
-- Function to increment points safely
CREATE OR REPLACE FUNCTION increment_points(id_param UUID, amount_param INT)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET points = points + amount_param
  WHERE id = id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to increment coins safely
CREATE OR REPLACE FUNCTION increment_coins(id_param UUID, amount_param INT)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET coins = coins + amount_param
  WHERE id = id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement coins safely
CREATE OR REPLACE FUNCTION decrement_coins(id_param UUID, amount_param INT)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET coins = coins - amount_param
  WHERE id = id_param AND coins >= amount_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak safely
CREATE OR REPLACE FUNCTION update_streak(id_param UUID, streak_param INT, last_date_param TIMESTAMPTZ)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET streak = streak_param, last_workout_date = last_date_param
  WHERE id = id_param;
END;
$$ LANGUAGE plpgsql;
*/
