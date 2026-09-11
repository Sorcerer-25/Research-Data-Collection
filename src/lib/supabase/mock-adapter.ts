import { Participant, SleepLog, StudySettings } from "@/types";

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: "p-admin-01",
    full_name: "Dr. Sarah Chen",
    email: "admin@sleepstudy.org",
    role: "admin",
    created_at: "2026-08-30T10:00:00Z",
  },
  {
    id: "p-001",
    full_name: "John Doe",
    email: "john@example.com",
    role: "participant",
    created_at: "2026-08-31T14:20:00Z",
  },
  {
    id: "p-002",
    full_name: "Emily Watson",
    email: "emily.w@example.com",
    role: "participant",
    created_at: "2026-08-31T15:00:00Z",
  },
  {
    id: "p-003",
    full_name: "Michael Chang",
    email: "m.chang@example.com",
    role: "participant",
    created_at: "2026-08-31T16:15:00Z",
  },
  {
    id: "p-004",
    full_name: "Sophia Martinez",
    email: "sophia.m@example.com",
    role: "participant",
    created_at: "2026-08-31T17:30:00Z",
  },
  {
    id: "p-005",
    full_name: "David Kim",
    email: "david.kim@example.com",
    role: "participant",
    created_at: "2026-08-31T18:45:00Z",
  },
  {
    id: "p-006",
    full_name: "Olivia Johnson",
    email: "olivia.j@example.com",
    role: "participant",
    created_at: "2026-09-01T08:10:00Z",
  },
  {
    id: "p-007",
    full_name: "Lucas Silva",
    email: "lucas.s@example.com",
    role: "participant",
    created_at: "2026-09-01T09:20:00Z",
  },
  {
    id: "p-008",
    full_name: "Amara Patel",
    email: "amara.p@example.com",
    role: "participant",
    created_at: "2026-09-01T10:00:00Z",
  },
];

const INITIAL_LOGS: SleepLog[] = [
  // John Doe logs (10/14 days)
  { id: "log-101", participant_id: "p-001", log_date: "2026-09-01", bed_time: "23:15", wake_time: "07:00", total_sleep_minutes: 465, sleep_quality: 4, notes: "Fell asleep quickly.", created_at: "2026-09-02T07:15:00Z" },
  { id: "log-102", participant_id: "p-001", log_date: "2026-09-02", bed_time: "23:45", wake_time: "07:15", total_sleep_minutes: 450, sleep_quality: 4, notes: "", created_at: "2026-09-03T07:20:00Z" },
  { id: "log-103", participant_id: "p-001", log_date: "2026-09-03", bed_time: "00:10", wake_time: "07:30", total_sleep_minutes: 440, sleep_quality: 3, notes: "Woke up once around 4 AM.", created_at: "2026-09-04T07:45:00Z" },
  { id: "log-104", participant_id: "p-001", log_date: "2026-09-04", bed_time: "23:30", wake_time: "07:00", total_sleep_minutes: 450, sleep_quality: 4, notes: "Felt well rested.", created_at: "2026-09-05T07:10:00Z" },
  { id: "log-105", participant_id: "p-001", log_date: "2026-09-05", bed_time: "00:30", wake_time: "08:15", total_sleep_minutes: 465, sleep_quality: 5, notes: "Weekend sleep in.", created_at: "2026-09-06T08:30:00Z" },
  { id: "log-106", participant_id: "p-001", log_date: "2026-09-06", bed_time: "23:45", wake_time: "07:30", total_sleep_minutes: 465, sleep_quality: 4, notes: "", created_at: "2026-09-07T07:40:00Z" },
  { id: "log-107", participant_id: "p-001", log_date: "2026-09-07", bed_time: "23:20", wake_time: "06:50", total_sleep_minutes: 450, sleep_quality: 3, notes: "Late caffeine before bed.", created_at: "2026-09-08T07:00:00Z" },
  { id: "log-108", participant_id: "p-001", log_date: "2026-09-08", bed_time: "23:00", wake_time: "07:00", total_sleep_minutes: 480, sleep_quality: 5, notes: "Deep restful sleep.", created_at: "2026-09-09T07:05:00Z" },
  { id: "log-109", participant_id: "p-001", log_date: "2026-09-09", bed_time: "23:45", wake_time: "07:30", total_sleep_minutes: 465, sleep_quality: 5, notes: "Good sleep", created_at: "2026-09-10T07:45:00Z" },
  { id: "log-110", participant_id: "p-001", log_date: "2026-09-10", bed_time: "00:10", wake_time: "07:00", total_sleep_minutes: 410, sleep_quality: 3, notes: "Slight headache.", created_at: "2026-09-11T07:15:00Z" },

  // Emily Watson logs (12/14 days)
  { id: "log-201", participant_id: "p-002", log_date: "2026-09-01", bed_time: "22:30", wake_time: "06:30", total_sleep_minutes: 480, sleep_quality: 5, notes: "Excellent.", created_at: "2026-09-02T06:40:00Z" },
  { id: "log-202", participant_id: "p-002", log_date: "2026-09-02", bed_time: "22:45", wake_time: "06:45", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-03T06:50:00Z" },
  { id: "log-203", participant_id: "p-002", log_date: "2026-09-03", bed_time: "23:00", wake_time: "06:30", total_sleep_minutes: 450, sleep_quality: 4, notes: "", created_at: "2026-09-04T06:45:00Z" },
  { id: "log-204", participant_id: "p-002", log_date: "2026-09-04", bed_time: "22:15", wake_time: "06:15", total_sleep_minutes: 480, sleep_quality: 5, notes: "Woke up naturally.", created_at: "2026-09-05T06:30:00Z" },
  { id: "log-205", participant_id: "p-002", log_date: "2026-09-05", bed_time: "23:15", wake_time: "07:30", total_sleep_minutes: 495, sleep_quality: 5, notes: "", created_at: "2026-09-06T07:45:00Z" },
  { id: "log-206", participant_id: "p-002", log_date: "2026-09-06", bed_time: "22:30", wake_time: "06:30", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-07T06:40:00Z" },
  { id: "log-207", participant_id: "p-002", log_date: "2026-09-07", bed_time: "22:40", wake_time: "06:40", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-08T06:50:00Z" },
  { id: "log-208", participant_id: "p-002", log_date: "2026-09-08", bed_time: "23:00", wake_time: "06:30", total_sleep_minutes: 450, sleep_quality: 3, notes: "Noisy outdoors.", created_at: "2026-09-09T06:40:00Z" },
  { id: "log-209", participant_id: "p-002", log_date: "2026-09-09", bed_time: "22:30", wake_time: "06:30", total_sleep_minutes: 480, sleep_quality: 5, notes: "", created_at: "2026-09-10T06:45:00Z" },
  { id: "log-210", participant_id: "p-002", log_date: "2026-09-10", bed_time: "22:45", wake_time: "06:45", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-11T06:55:00Z" },
  { id: "log-211", participant_id: "p-002", log_date: "2026-09-11", bed_time: "22:30", wake_time: "06:30", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-12T06:35:00Z" },

  // Michael Chang logs (9/14 days)
  { id: "log-301", participant_id: "p-003", log_date: "2026-09-01", bed_time: "01:00", wake_time: "08:30", total_sleep_minutes: 450, sleep_quality: 3, notes: "Late night study.", created_at: "2026-09-02T08:45:00Z" },
  { id: "log-302", participant_id: "p-003", log_date: "2026-09-02", bed_time: "00:45", wake_time: "08:00", total_sleep_minutes: 435, sleep_quality: 3, notes: "", created_at: "2026-09-03T08:15:00Z" },
  { id: "log-303", participant_id: "p-003", log_date: "2026-09-04", bed_time: "01:15", wake_time: "08:15", total_sleep_minutes: 420, sleep_quality: 2, notes: "Difficulty falling asleep.", created_at: "2026-09-05T08:30:00Z" },
  { id: "log-304", participant_id: "p-003", log_date: "2026-09-05", bed_time: "02:00", wake_time: "09:30", total_sleep_minutes: 450, sleep_quality: 4, notes: "", created_at: "2026-09-06T09:45:00Z" },
  { id: "log-305", participant_id: "p-003", log_date: "2026-09-07", bed_time: "00:30", wake_time: "07:30", total_sleep_minutes: 420, sleep_quality: 3, notes: "", created_at: "2026-09-08T07:45:00Z" },
  { id: "log-306", participant_id: "p-003", log_date: "2026-09-08", bed_time: "00:45", wake_time: "08:00", total_sleep_minutes: 435, sleep_quality: 3, notes: "", created_at: "2026-09-09T08:15:00Z" },
  { id: "log-307", participant_id: "p-003", log_date: "2026-09-09", bed_time: "01:00", wake_time: "08:00", total_sleep_minutes: 420, sleep_quality: 3, notes: "", created_at: "2026-09-10T08:20:00Z" },
  { id: "log-308", participant_id: "p-003", log_date: "2026-09-10", bed_time: "00:30", wake_time: "07:45", total_sleep_minutes: 435, sleep_quality: 4, notes: "", created_at: "2026-09-11T08:00:00Z" },

  // Sophia Martinez logs (13/14 days)
  { id: "log-401", participant_id: "p-004", log_date: "2026-09-01", bed_time: "23:00", wake_time: "07:00", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-02T07:15:00Z" },
  { id: "log-402", participant_id: "p-004", log_date: "2026-09-02", bed_time: "23:15", wake_time: "07:15", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-03T07:25:00Z" },
  { id: "log-403", participant_id: "p-004", log_date: "2026-09-03", bed_time: "22:50", wake_time: "07:00", total_sleep_minutes: 490, sleep_quality: 5, notes: "Very peaceful.", created_at: "2026-09-04T07:10:00Z" },
  { id: "log-404", participant_id: "p-004", log_date: "2026-09-04", bed_time: "23:30", wake_time: "07:30", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-05T07:40:00Z" },
  { id: "log-405", participant_id: "p-004", log_date: "2026-09-05", bed_time: "00:00", wake_time: "08:00", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-06T08:15:00Z" },
  { id: "log-406", participant_id: "p-004", log_date: "2026-09-06", bed_time: "23:15", wake_time: "07:15", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-07T07:20:00Z" },
  { id: "log-407", participant_id: "p-004", log_date: "2026-09-07", bed_time: "23:00", wake_time: "07:00", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-08T07:10:00Z" },
  { id: "log-408", participant_id: "p-004", log_date: "2026-09-08", bed_time: "23:10", wake_time: "07:10", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-09T07:20:00Z" },
  { id: "log-409", participant_id: "p-004", log_date: "2026-09-09", bed_time: "23:00", wake_time: "07:00", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-10T07:15:00Z" },
  { id: "log-410", participant_id: "p-004", log_date: "2026-09-10", bed_time: "23:20", wake_time: "07:20", total_sleep_minutes: 480, sleep_quality: 5, notes: "", created_at: "2026-09-11T07:30:00Z" },
  { id: "log-411", participant_id: "p-004", log_date: "2026-09-11", bed_time: "23:00", wake_time: "07:00", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-12T07:10:00Z" },
  { id: "log-412", participant_id: "p-004", log_date: "2026-09-12", bed_time: "23:15", wake_time: "07:15", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-13T07:20:00Z" },
  { id: "log-413", participant_id: "p-004", log_date: "2026-09-13", bed_time: "23:00", wake_time: "07:00", total_sleep_minutes: 480, sleep_quality: 4, notes: "", created_at: "2026-09-14T07:15:00Z" },
];

const STORAGE_KEYS = {
  PARTICIPANTS: "sleep_study_participants",
  LOGS: "sleep_study_logs",
  CURRENT_USER: "sleep_study_session_user",
};

export class MockStorageManager {
  private static getStored<T>(key: string, defaultVal: T): T {
    if (typeof window === "undefined") return defaultVal;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private static setStored<T>(key: string, val: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error("Storage write error", e);
    }
  }

  static getParticipants(): Participant[] {
    return this.getStored<Participant[]>(STORAGE_KEYS.PARTICIPANTS, INITIAL_PARTICIPANTS);
  }

  static saveParticipants(participants: Participant[]) {
    this.setStored(STORAGE_KEYS.PARTICIPANTS, participants);
  }

  static getLogs(): SleepLog[] {
    return this.getStored<SleepLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  }

  static saveLogs(logs: SleepLog[]) {
    this.setStored(STORAGE_KEYS.LOGS, logs);
  }

  static getSessionUser(): Participant | null {
    return this.getStored<Participant | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_PARTICIPANTS[1]); // Defaults to John Doe for quick preview
  }

  static setSessionUser(user: Participant | null) {
    this.setStored(STORAGE_KEYS.CURRENT_USER, user);
  }

  static clearSession() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
}
