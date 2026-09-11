import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Participant, SleepLog, StudyStats, ParticipantSummary } from "@/types";
import { MockStorageManager } from "./mock-adapter";
import { getStudyConfig, getStudyDayNumber } from "../study-config";
import { formatDurationHoursMinutes } from "../sleep-calculations";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-ref")
  );
};

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance && supabaseUrl && supabaseAnonKey) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
}

// ----------------------------------------------------------------------
// Unified Data & Auth Service Layer
// ----------------------------------------------------------------------

export async function authRegister(
  fullName: string,
  email: string,
  password: string
): Promise<{ user: Participant | null; error: string | null }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "participant",
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Fetch participant row
        const { data: pData } = await client
          .from("participants")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const participant: Participant = pData || {
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: "participant",
          created_at: new Date().toISOString(),
        };

        return { user: participant, error: null };
      }
      return { user: null, error: "Registration failed. Please try again." };
    } catch (err: any) {
      return { user: null, error: err?.message || "Unknown error during registration" };
    }
  }

  // Fallback Mock Mode
  await new Promise((resolve) => setTimeout(resolve, 400));
  const participants = MockStorageManager.getParticipants();
  const existing = participants.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { user: null, error: "An account with this email already exists." };
  }

  const newParticipant: Participant = {
    id: `p-${Date.now()}`,
    full_name: fullName,
    email: email.toLowerCase(),
    role: "participant",
    created_at: new Date().toISOString(),
  };

  MockStorageManager.saveParticipants([...participants, newParticipant]);
  MockStorageManager.setSessionUser(newParticipant);
  return { user: newParticipant, error: null };
}

export async function authLogin(
  email: string,
  password: string
): Promise<{ user: Participant | null; error: string | null }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const { data: pData, error: pError } = await client
          .from("participants")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (pError || !pData) {
          // If profile table trigger hasn't fired yet, build fallback
          const fallbackUser: Participant = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || email.split("@")[0],
            email: data.user.email || email,
            role: (data.user.user_metadata?.role as any) || "participant",
            created_at: data.user.created_at,
          };
          return { user: fallbackUser, error: null };
        }

        return { user: pData as Participant, error: null };
      }
      return { user: null, error: "Unable to sign in. Please verify your credentials." };
    } catch (err: any) {
      return { user: null, error: err?.message || "Authentication error." };
    }
  }

  // Fallback Mock Mode
  await new Promise((resolve) => setTimeout(resolve, 350));
  const participants = MockStorageManager.getParticipants();
  const normalizedEmail = email.trim().toLowerCase();

  // Special check for demo admin
  if (normalizedEmail === "admin@sleepstudy.org") {
    const adminUser = participants.find((p) => p.email === "admin@sleepstudy.org") || {
      id: "p-admin-01",
      full_name: "Dr. Sarah Chen",
      email: "admin@sleepstudy.org",
      role: "admin" as const,
      created_at: new Date().toISOString(),
    };
    MockStorageManager.setSessionUser(adminUser);
    return { user: adminUser, error: null };
  }

  const foundUser = participants.find((p) => p.email.toLowerCase() === normalizedEmail);
  if (!foundUser) {
    return { user: null, error: "Invalid email or password." };
  }

  MockStorageManager.setSessionUser(foundUser);
  return { user: foundUser, error: null };
}

export async function authLogout(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
  MockStorageManager.clearSession();
}

export async function getCurrentUser(): Promise<Participant | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) return null;

      const { data: pData } = await client
        .from("participants")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (pData) return pData as Participant;

      return {
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Participant",
        email: session.user.email || "",
        role: (session.user.user_metadata?.role as any) || "participant",
        created_at: session.user.created_at,
      };
    } catch (e) {
      console.error("Error retrieving current user:", e);
      return null;
    }
  }

  return MockStorageManager.getSessionUser();
}

export async function getParticipantLogs(participantId: string): Promise<SleepLog[]> {
  const client = getSupabaseClient();
  if (client) {
    const { data, error } = await client
      .from("sleep_logs")
      .select("*")
      .eq("participant_id", participantId)
      .order("log_date", { ascending: false });

    if (error) {
      console.error("Error fetching participant logs:", error);
      return [];
    }
    return data || [];
  }

  const logs = MockStorageManager.getLogs();
  return logs
    .filter((l) => l.participant_id === participantId)
    .sort((a, b) => b.log_date.localeCompare(a.log_date));
}

export async function upsertSleepLog(
  log: Omit<SleepLog, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<{ data: SleepLog | null; error: string | null }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload = {
        participant_id: log.participant_id,
        log_date: log.log_date,
        bed_time: log.bed_time,
        wake_time: log.wake_time,
        total_sleep_minutes: log.total_sleep_minutes,
        sleep_quality: log.sleep_quality || null,
        notes: log.notes || null,
      };

      const { data, error } = await client
        .from("sleep_logs")
        .upsert(payload, { onConflict: "participant_id, log_date" })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e?.message || "Failed to save sleep entry." };
    }
  }

  // Fallback Mock Mode
  await new Promise((resolve) => setTimeout(resolve, 350));
  const logs = MockStorageManager.getLogs();
  const existingIdx = logs.findIndex(
    (l) => l.participant_id === log.participant_id && l.log_date === log.log_date
  );

  let updatedLog: SleepLog;
  if (existingIdx >= 0) {
    updatedLog = {
      ...logs[existingIdx],
      ...log,
      id: logs[existingIdx].id,
      updated_at: new Date().toISOString(),
    };
    logs[existingIdx] = updatedLog;
  } else {
    updatedLog = {
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...log,
    };
    logs.unshift(updatedLog);
  }

  MockStorageManager.saveLogs(logs);
  return { data: updatedLog, error: null };
}

export async function deleteSleepLog(logId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    const { error } = await client.from("sleep_logs").delete().eq("id", logId);
    return !error;
  }

  const logs = MockStorageManager.getLogs();
  const filtered = logs.filter((l) => l.id !== logId);
  MockStorageManager.saveLogs(filtered);
  return true;
}

export interface AdminStudyData {
  participants: Participant[];
  logs: SleepLog[];
  stats: StudyStats;
  participantSummaries: ParticipantSummary[];
}

export async function getAdminStudyData(): Promise<AdminStudyData> {
  const config = getStudyConfig();
  const client = getSupabaseClient();

  let participants: Participant[] = [];
  let logs: SleepLog[] = [];

  if (client) {
    const [pRes, lRes] = await Promise.all([
      client.from("participants").select("*").order("created_at", { ascending: false }),
      client.from("sleep_logs").select("*, participant:participants(full_name, email)").order("log_date", { ascending: false }),
    ]);

    participants = pRes.data || [];
    logs = lRes.data || [];
  } else {
    participants = MockStorageManager.getParticipants();
    const rawLogs = MockStorageManager.getLogs();
    logs = rawLogs.map((l) => {
      const p = participants.find((part) => part.id === l.participant_id);
      return {
        ...l,
        participant: p ? { full_name: p.full_name, email: p.email } : undefined,
      };
    });
  }

  // Filter study participants (excluding admin from participant pool metrics)
  const studyParticipants = participants.filter((p) => p.role === "participant");
  const totalParticipants = studyParticipants.length;
  const totalEntries = logs.length;
  const expectedEntries = totalParticipants * config.targetDays;
  const overallCompletionPercentage = expectedEntries > 0
    ? Number(((totalEntries / expectedEntries) * 100).toFixed(1))
    : 0;

  const totalSleepMinutesSum = logs.reduce((acc, l) => acc + (l.total_sleep_minutes || 0), 0);
  const averageSleepMinutes = totalEntries > 0 ? Math.round(totalSleepMinutesSum / totalEntries) : 0;
  const averageSleepFormatted = formatDurationHoursMinutes(averageSleepMinutes);

  const qualityLogs = logs.filter((l) => typeof l.sleep_quality === "number" && l.sleep_quality > 0);
  const qualitySum = qualityLogs.reduce((acc, l) => acc + (l.sleep_quality || 0), 0);
  const averageQuality = qualityLogs.length > 0 ? Number((qualitySum / qualityLogs.length).toFixed(1)) : null;

  // Calculate participant summaries
  const participantSummaries: ParticipantSummary[] = studyParticipants.map((p) => {
    const pLogs = logs.filter((l) => l.participant_id === p.id);
    const completedDays = pLogs.length;
    const completionPercentage = Number(((completedDays / config.targetDays) * 100).toFixed(1));

    const pMinutes = pLogs.map((l) => l.total_sleep_minutes);
    const pMinutesSum = pMinutes.reduce((a, b) => a + b, 0);
    const pAvgMinutes = completedDays > 0 ? Math.round(pMinutesSum / completedDays) : 0;
    const minSleep = pMinutes.length > 0 ? Math.min(...pMinutes) : 0;
    const maxSleep = pMinutes.length > 0 ? Math.max(...pMinutes) : 0;

    const pQualities = pLogs.filter((l) => typeof l.sleep_quality === "number" && l.sleep_quality > 0).map((l) => l.sleep_quality as number);
    const pAvgQuality = pQualities.length > 0
      ? Number((pQualities.reduce((a, b) => a + b, 0) / pQualities.length).toFixed(1))
      : null;

    const sortedDates = [...pLogs].sort((a, b) => b.log_date.localeCompare(a.log_date));
    const lastLogDate = sortedDates.length > 0 ? sortedDates[0].log_date : null;

    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      expected_days: config.targetDays,
      completed_days: completedDays,
      completion_percentage: Math.min(100, completionPercentage),
      average_sleep_minutes: pAvgMinutes,
      average_sleep_formatted: formatDurationHoursMinutes(pAvgMinutes),
      min_sleep_minutes: minSleep,
      max_sleep_minutes: maxSleep,
      average_quality: pAvgQuality,
      last_log_date: lastLogDate,
    };
  });

  return {
    participants,
    logs,
    stats: {
      total_participants: totalParticipants,
      total_entries: totalEntries,
      expected_entries: expectedEntries,
      overall_completion_percentage: overallCompletionPercentage,
      average_sleep_minutes: averageSleepMinutes,
      average_sleep_formatted: averageSleepFormatted,
      average_quality: averageQuality,
    },
    participantSummaries,
  };
}
