# Supabase Database Setup Guide

This folder contains the complete PostgreSQL database schema, tables, constraints, functions, triggers, and Row Level Security (RLS) policies for the **Sleep Study & Data Collection Web App**.

## How to Apply Schema to Supabase

1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Select your project (or create a new project).
3. Navigate to **SQL Editor** in the left sidebar.
4. Click **New Query**.
5. Copy and paste the entire contents of [`schema.sql`](./schema.sql).
6. Click **Run** (or `Ctrl + Enter`).

## Granting Admin Privileges

By default, any new registered user has the role `participant`. To grant a researcher/administrator access to the `/admin` dashboard:

```sql
UPDATE public.participants 
SET role = 'admin' 
WHERE email = 'researcher@example.com';
```

## Tables Overview

- `public.participants`: User profile linked to `auth.users`, storing `full_name`, `email`, `role`, and timestamps.
- `public.study_settings`: Configurable study windows (`study_start_date`, `study_end_date`, `target_days`, `is_active`).
- `public.sleep_logs`: Daily sleep logs storing `participant_id`, `log_date`, `bed_time`, `wake_time`, `total_sleep_minutes`, `sleep_quality` (1–5), and `notes`. Enforces `UNIQUE(participant_id, log_date)` to prevent duplicates.

## Security & Row Level Security (RLS)

- **Participants**: Can ONLY view, create, and update their own participant profile and sleep entries.
- **Admins**: Can view all participants, all sleep logs, aggregated stats, and export study data to Excel.
- **Service Role Key**: Is never exposed to client-side code.
