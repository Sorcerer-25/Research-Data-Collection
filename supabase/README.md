# Supabase Database Setup Guide

This folder contains the complete PostgreSQL database schema, tables, constraints, functions, triggers, and Row Level Security (RLS) policies for the **Sleep Study & Data Collection Web App**.

## How to Apply Schema to Supabase

### Fresh Setup:
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Select your project (or create a new project).
3. Navigate to **SQL Editor** in the left sidebar.
4. Click **New Query**.
5. Copy and paste the entire contents of [`schema.sql`](./schema.sql).
6. Click **Run** (or `Ctrl + Enter`).

### Updating an Existing Supabase Database:
If you have already run the previous `schema.sql`, you can simply run the migration script:
1. Navigate to **SQL Editor** in your Supabase Dashboard.
2. Open [`migration_add_roll_batch.sql`](./migration_add_roll_batch.sql).
3. Copy and paste the contents into a new query and click **Run**.

## Granting Admin Privileges

By default, any new registered user has the role `participant`. To grant a researcher/administrator access to the `/admin` dashboard:

```sql
UPDATE public.participants 
SET role = 'admin' 
WHERE email = 'researcher@example.com';
```

## Tables Overview

- `public.participants`: User profile linked to `auth.users`, storing `full_name`, `email`, `role`, `roll_number`, `batch_number`, and timestamps.
- `public.study_settings`: Configurable study defaults and target days.
- `public.sleep_logs`: Daily sleep logs storing `participant_id`, `log_date`, `bed_time`, `wake_time`, and `total_sleep_minutes`. Enforces `UNIQUE(participant_id, log_date)` to prevent duplicate entries per day.

## Security & Row Level Security (RLS)

- **Participants**: Can ONLY view, create, and update their own participant profile (including Roll Number and Batch Number) and sleep entries.
- **Admins**: Can view all participants, all sleep logs, aggregated stats, and export study data to Excel.
- **Service Role Key**: Is never exposed to client-side code.
