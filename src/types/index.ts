export type UserRole = "participant" | "admin";

export interface Participant {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface SleepLog {
  id: string;
  participant_id: string;
  log_date: string; // YYYY-MM-DD
  bed_time: string; // HH:mm (24-hour format)
  wake_time: string; // HH:mm (24-hour format)
  total_sleep_minutes: number;
  created_at: string;
  updated_at?: string;
  participant?: {
    full_name: string;
    email: string;
  };
}

export interface StudySettings {
  id: number;
  study_name: string;
  study_start_date: string; // YYYY-MM-DD
  study_end_date: string; // YYYY-MM-DD
  target_days: number;
  is_active: boolean;
}

export interface ParticipantSummary {
  id: string;
  full_name: string;
  email: string;
  role?: UserRole;
  expected_days: number;
  completed_days: number;
  completion_percentage: number;
  average_sleep_minutes: number;
  average_sleep_formatted: string;
  min_sleep_minutes: number;
  max_sleep_minutes: number;
  last_log_date: string | null;
  logs?: SleepLog[];
}

export interface StudyStats {
  total_participants: number;
  active_participants_count: number;
  total_entries: number;
  expected_entries: number;
  overall_completion_percentage: number;
  average_sleep_minutes: number;
  average_sleep_formatted: string;
}

