/**
 * Configurable Study Settings & Day Utilities
 */

export interface StudyConfig {
  studyName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  targetDays: number;
}

export function getStudyConfig(): StudyConfig {
  // Defaults to 14-day study period
  const studyName = process.env.NEXT_PUBLIC_STUDY_NAME || "14-Day Sleep Quality & Circadian Rhythm Study";
  const startDate = process.env.NEXT_PUBLIC_STUDY_START_DATE || "2026-09-01";
  const endDate = process.env.NEXT_PUBLIC_STUDY_END_DATE || "2026-09-14";
  const targetDays = parseInt(process.env.NEXT_PUBLIC_STUDY_DAYS || "14", 10) || 14;

  return {
    studyName,
    startDate,
    endDate,
    targetDays,
  };
}

/**
 * Calculates study day number for a given date (1-indexed).
 * E.g., if startDate is 2026-09-01, then 2026-09-01 is Day 1, 2026-09-10 is Day 10.
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

export interface StudyDayInfo {
  dayNumber: number;
  dateStr: string;
  formattedDate: string;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Generates an array of all study days in the study window.
 */
export function getAllStudyDays(config?: StudyConfig): StudyDayInfo[] {
  const currentConfig = config || getStudyConfig();
  const days: StudyDayInfo[] = [];

  const [sYear, sMonth, sDay] = currentConfig.startDate.split("-").map(Number);
  const [eYear, eMonth, eDay] = currentConfig.endDate.split("-").map(Number);

  const start = new Date(Date.UTC(sYear, sMonth - 1, sDay));
  const end = new Date(Date.UTC(eYear, eMonth - 1, eDay));

  const todayStr = new Date().toISOString().split("T")[0];

  let current = new Date(start);
  let dayNum = 1;

  while (current <= end && dayNum <= currentConfig.targetDays) {
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
      dayNumber: dayNum,
      dateStr,
      formattedDate: dateDisplay,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    });

    current.setUTCDate(current.getUTCDate() + 1);
    dayNum++;
  }

  return days;
}
