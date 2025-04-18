-- users table
CREATE TABLE IF NOT EXISTS "Users" (
  user_id   SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  password  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- links table
CREATE TABLE IF NOT EXISTS links (
  link_id   SERIAL PRIMARY KEY,
  url       TEXT NOT NULL,
  user_id   INT REFERENCES "Users"(user_id) ON DELETE CASCADE,
  code      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (url)
);
