-- Supabase table schema for DESP Solutions assessments
-- Run this in the Supabase SQL editor for your project.

create table if not exists assessments (
  id text primary key,
  createdAt timestamptz not null default now(),
  patient jsonb not null default '{}',
  medicalHistory jsonb not null default '[]',
  symptoms jsonb not null default '[]',
  ocularHistory jsonb not null default '[]',
  screenTime numeric not null default 0,
  devices jsonb not null default '[]',
  deviceHours jsonb not null default '{}',
  usageTypes jsonb not null default '[]',
  eyeImages jsonb not null default '{}',
  result jsonb not null default '{}'
);

-- Optional indexes for faster admin queries
create index if not exists idx_assessments_createdAt on assessments (createdAt desc);
create index if not exists idx_assessments_patient_name on assessments ((patient->>'fullName'));
