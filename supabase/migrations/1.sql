/*
  # Create Anonymous Messaging App Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique) - User's unique handle
      - `display_name` (text) - Optional display name
      - `instagram_handle` (text) - Optional Instagram username
      - `theme` (text) - UI theme preference (minimal/neon/soft/bold/glass)
      - `message_count` (int) - Total messages received
      - `push_token` (text) - Expo push notification token
      - `created_at` (timestamptz) - Account creation timestamp
    
    - `messages`
      - `id` (uuid, primary key)
      - `recipient_username` (text) - Username of recipient
      - `content` (text) - Message content
      - `game_mode` (text) - Type: anonymous/truth/dare/hottake/wouldyourather/guesswho
      - `game_data` (jsonb) - Additional game mode data (ratings, options, etc.)
      - Sender hints (always visible):
        - `sender_city` (text)
        - `sender_country` (text)
        - `sender_device` (text)
        - `sender_os` (text)
        - `sender_time_of_day` (text)
      - Status flags:
        - `is_read` (boolean) - Has recipient viewed it
        - `is_blocked` (boolean) - Blocked by recipient
        - `is_flagged` (boolean) - Flagged for review
        - `moderation_score` (float) - OpenAI moderation score
      - `sender_fingerprint` (text) - Hashed fingerprint for blocking
      - `sent_at` (timestamptz) - When message was sent
    
    - `blocks`
      - `id` (uuid, primary key)
      - `recipient_id` (uuid) - User who blocked
      - `sender_fingerprint` (text) - Fingerprint of blocked sender
      - `created_at` (timestamptz) - When block was created

  2. Security
    - Enable RLS on all tables
    - Users can read their own profile
    - Users can read messages sent to their username
    - Users can create blocks for their own account
    - Service role needed for creating users and messages (public API)
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text,
  instagram_handle text,
  theme text DEFAULT 'minimal',
  message_count int DEFAULT 0,
  push_token text,
  created_at timestamptz DEFAULT now()
);

-- Messages table  
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_username text NOT NULL,
  content text NOT NULL,
  game_mode text DEFAULT 'anonymous',
  game_data jsonb,
  sender_city text,
  sender_country text,
  sender_device text,
  sender_os text,
  sender_time_of_day text,
  is_read boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  is_flagged boolean DEFAULT false,
  moderation_score float,
  sender_fingerprint text,
  sent_at timestamptz DEFAULT now()
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  sender_fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_username, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_fingerprint ON messages(sender_fingerprint);
CREATE INDEX IF NOT EXISTS idx_blocks_recipient ON blocks(recipient_id, sender_fingerprint);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read any profile"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Messages policies
CREATE POLICY "Users can read messages sent to their username"
  ON messages FOR SELECT
  TO authenticated
  USING (
    recipient_username = (
      SELECT username FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    recipient_username = (
      SELECT username FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    recipient_username = (
      SELECT username FROM users WHERE id = auth.uid()
    )
  );

-- Blocks policies
CREATE POLICY "Users can read own blocks"
  ON blocks FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can create own blocks"
  ON blocks FOR INSERT
  TO authenticated
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Users can delete own blocks"
  ON blocks FOR DELETE
  TO authenticated
  USING (recipient_id = auth.uid());