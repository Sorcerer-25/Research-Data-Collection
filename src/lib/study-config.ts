/**
 * Flexible Study Settings & Dynamic Day Utilities
 */

export interface StudyConfig {
  studyName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  targetDays: number;
}

/**
 * Returns today's date in YYYY-MM-DD format based on local time
 */
export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Adds an integer number of days to a YYYY-MM-DD date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  const resYear = d.getUTCFullYear();
  const resMonth = String(d.getUTCMonth() + 1).padStart(2, "0");
  const resDay = String(d.getUTCDate()).padStart(2, "0");
  return `${resYear}-${resMonth}-${resDay}`;
}

/**
 * Returns the study configuration.
 * If participantStartDate is passed (or if dynamic mode is active),
 * Day 1 is the participant's start date (defaulting to today),
 * and Day 14 is startDate + (targetDays - 1) days.
 */
export function getStudyConfig(participantStartDate?: string): StudyConfig {
  const studyName = process.env.NEXT_PUBLIC_STUDY_NAME || "14-Day Sleep Quality & Circadian Rhythm Study";
  const targetDays = parseInt(process.env.NEXT_PUBLIC_STUDY_DAYS || "14", 10) || 14;
  
  // Use participant's start date, or default to today's date as Day 1
  const startDate = participantStartDate || getTodayDateStr();
  const endDate = addDaysToDate(startDate, targetDays - 1);

  return {
    studyName,
    startDate,
    endDate,
    targetDays,
  };
}

/**
 * Calculates study day number for a given date (1-indexed).
 * E.g., if Day 1 is today (e.g. 2026-09-16), then 2026-09-16 is Day 1, 2026-09-17 is Day 2, etc.
 */
export function getStudyDayNumber(dateStr: string, startDateStr?: string): number {
  const start = startDateStr || getStudyConfig().startDate;
  const [sYear, sMonth, sDay] = start.split("-").map(Number);
  const [dYear, dMonth, dDay] = dateStr.split("-").map(Number);

  const startDate = new Date(Date.UTC(sYear, sMonth - 1, sDay));
  const targetDate = new Date(Date.UTC(dYear, dMonth - 1, dDay));

  const diffTime = targetDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Checks whether a given date falls within the allowed study period.
 */
export function isDateWithinStudy(dateStr: string, config?: StudyConfig): boolean {
  const currentConfig = config || getStudyConfig();
  return dateStr >= currentConfig.startDate && dateStr <= currentConfig.endDate;
}

/**
 * Checks whether a given date is valid for logging:
 * - Cannot be in the future (must be <= today)
 * - If user has no logs yet, date must be today (to establish Day 1)
 * - Must be within the 14-day study window [startDate, endDate]
 */
export function isDateAllowedForLogging(
  dateStr: string,
  config?: StudyConfig,
  hasLogs: boolean = true
): { allowed: boolean; reason?: string } {
  const currentConfig = config || getStudyConfig();
  const todayStr = getTodayDateStr();

  if (dateStr > todayStr) {
    return {
      allowed: false,
      reason: "You cannot record sleep for a future date. Please select today or a past study day.",
    };
  }

  if (!hasLogs) {
    if (dateStr !== todayStr) {
      return {
        allowed: false,
        reason: "Your first sleep entry must be recorded for today's date to establish Day 1 of your study.",
      };
    }
    return { allowed: true };
  }

  if (dateStr < currentConfig.startDate) {
    return {
      allowed: false,
      reason: `Date cannot be earlier than Day 1 of your study (${currentConfig.startDate}).`,
    };
  }

  if (dateStr > currentConfig.endDate) {
    return {
      allowed: false,
      reason: `Date is beyond the ${currentConfig.targetDays}-day study period (${currentConfig.startDate} to ${currentConfig.endDate}).`,
    };
  }

  return { allowed: true };
}

export interface StudyDayInfo {
  dayNumber: number;
  dateStr: string;
  formattedDate: string;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Generates an array of all 14 study days relative to the start date.
 */
export function getAllStudyDays(config?: StudyConfig): StudyDayInfo[] {
  const currentConfig = config || getStudyConfig();
  const days: StudyDayInfo[] = [];

  const [sYear, sMonth, sDay] = currentConfig.startDate.split("-").map(Number);
  const start = new Date(Date.UTC(sYear, sMonth - 1, sDay));
  const todayStr = getTodayDateStr();

  for (let i = 0; i < currentConfig.targetDays; i++) {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + i);

    const year = current.getUTCFullYear();
    const month = String(current.getUTCMonth() + 1).padStart(2, "0");
    const day = String(current.getUTCDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const dateDisplay = current.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
    });

    days.push({
      dayNumber: i + 1,
      dateStr,
      formattedDate: dateDisplay,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    });
  }

  return days;
}
