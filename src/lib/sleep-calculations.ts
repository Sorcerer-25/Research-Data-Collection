/**
 * Sleep Study Duration and Formatting Utilities
 */

/**
 * Parses time string (e.g., "23:30", "07:15") into total minutes from midnight (0 to 1439).
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Calculates overnight sleep duration in minutes.
 * Handles overnight sleep crossing midnight accurately:
 * - 23:00 -> 07:00 = 480 min (8h 0m)
 * - 23:30 -> 07:15 = 465 min (7h 45m)
 * - 23:30 -> 06:30 = 420 min (7h 0m)
 * - 00:30 -> 08:00 = 450 min (7h 30m)
 * - 22:15 -> 06:45 = 510 min (8h 30m)
 */
export function calculateSleepDurationMinutes(bedTimeStr: string, wakeTimeStr: string): number {
  if (!bedTimeStr || !wakeTimeStr) return 0;

  const bedMinutes = timeStringToMinutes(bedTimeStr);
  const wakeMinutes = timeStringToMinutes(wakeTimeStr);

  if (wakeMinutes >= bedMinutes) {
    // Same-day sleep (e.g., 01:00 to 09:00, or daytime nap)
    return wakeMinutes - bedMinutes;
  } else {
    // Overnight sleep crossing midnight (e.g., 23:30 to 07:15)
    return 1440 - bedMinutes + wakeMinutes;
  }
}

/**
 * Formats duration minutes into human-readable string (e.g., 465 -> "7h 45m", 480 -> "8h 0m")
 */
export function formatDurationHoursMinutes(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (remainingMinutes === 0) {
    return `${hours}h 00m`;
  }
  return `${hours}h ${remainingMinutes < 10 ? "0" : ""}${remainingMinutes}m`;
}

/**
 * Formats duration minutes into decimal hours for Excel and statistics (e.g., 465 -> 7.75)
 */
export function formatDurationDecimalHours(minutes: number): number {
  if (isNaN(minutes) || minutes <= 0) return 0;
  return Number((minutes / 60).toFixed(2));
}

/**
 * Formats 24h time ("23:30") to 12h display ("11:30 PM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24) return "--:--";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  if (isNaN(h)) return time24;

  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const displayMin = m < 10 ? `0${m}` : m;
  return `${displayHour}:${displayMin} ${period}`;
}

/**
 * Formats date string (YYYY-MM-DD) into readable format (e.g., "Sep 11, 2026" or "Sep 11")
 */
export function formatDateDisplay(dateStr: string, includeYear: boolean = false): string {
  if (!dateStr) return "--";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: includeYear ? "numeric" : undefined,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Sleep quality labels for 1 to 5 scale
 */
export const SLEEP_QUALITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Very Poor", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" },
  2: { label: "Poor", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800" },
  3: { label: "Fair", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  4: { label: "Good", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  5: { label: "Excellent", color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" },
};
