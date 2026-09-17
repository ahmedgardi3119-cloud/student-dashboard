-- Run this once on your Supabase / Railway / Render PostgreSQL database
-- (Supabase: paste into SQL Editor. Railway/Render: use their SQL console or `psql`.)

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    course TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);