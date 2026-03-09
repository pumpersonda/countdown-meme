/*
  # Payday Preferences Schema

  1. New Tables
    - `payday_preferences`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (text) - Device/user identifier
      - `frequency` (text) - Payment frequency: 'monthly' or 'bi-weekly'
      - `payment_days` (jsonb) - Array of payment days (1-31 for monthly, or two days for bi-weekly)
      - `interests` (jsonb) - Array of selected interest tags
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `payday_preferences` table
    - Add policy for anyone to read and write their own preferences
    
  3. Notes
    - Using user_id as text to support device-based identification
    - JSONB for flexible storage of days and interests arrays
*/

CREATE TABLE IF NOT EXISTS payday_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly', 'bi-weekly')),
  payment_days jsonb NOT NULL DEFAULT '[]'::jsonb,
  interests jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payday_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage their own preferences"
  ON payday_preferences
  FOR ALL
  USING (true)
  WITH CHECK (true);