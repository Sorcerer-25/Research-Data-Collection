import { Participant, SleepLog } from "@/types";

const INITIAL_PARTICIPANTS: Participant[] = [];
const INITIAL_LOGS: SleepLog[] = [];

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
    return this.getStored<Participant | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static setSessionUser(user: Participant | null) {
    this.setStored(STORAGE_KEYS.CURRENT_USER, user);
  }

  static clearSession() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
    }
  }
}
