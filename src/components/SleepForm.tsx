"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SleepLog } from "@/types";
import {
  calculateSleepDurationMinutes,
  formatDurationHoursMinutes,
  formatTime12Hour,
} from "@/lib/sleep-calculations";
import { getStudyConfig, getStudyDayNumber, isDateWithinStudy } from "@/lib/study-config";
import { upsertSleepLog } from "@/lib/supabase/client";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Moon,
  Sun,
  Edit3,
} from "lucide-react";

interface SleepFormProps {
  participantId: string;
  existingLogs: SleepLog[];
  initialDate?: string;
  onSuccess?: (savedLog: SleepLog) => void;
  onCancel?: () => void;
}

export default function SleepForm({
  participantId,
  existingLogs,
  initialDate,
  onSuccess,
  onCancel,
}: SleepFormProps) {
  const config = getStudyConfig();

  // Pick default date: initialDate or today (or last study day if today is after study)
  const defaultDate = useMemo(() => {
    if (initialDate && isDateWithinStudy(initialDate, config)) {
      return initialDate;
    }
    const today = new Date().toISOString().split("T")[0];
    if (isDateWithinStudy(today, config)) {
      return today;
    }
    return config.startDate;
  }, [initialDate, config]);

  const [logDate, setLogDate] = useState<string>(defaultDate);
  const [bedTime, setBedTime] = useState<string>("23:30");
  const [wakeTime, setWakeTime] = useState<string>("07:15");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingLogId, setExistingLogId] = useState<string | null>(null);

  // Check if an existing log exists for the currently selected date
  useEffect(() => {
    const existing = existingLogs.find((l) => l.log_date === logDate);
    if (existing) {
      setExistingLogId(existing.id);
      setBedTime(existing.bed_time || "23:30");
      setWakeTime(existing.wake_time || "07:15");
    } else {
      setExistingLogId(null);
      // Reset to sensible defaults if changing to a new date
      if (!existingLogs.some((l) => l.id === existingLogId)) {
        setBedTime("23:30");
        setWakeTime("07:15");
      }
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [logDate, existingLogs]);

  // Calculate live sleep duration
  const calculatedMinutes = useMemo(() => {
    return calculateSleepDurationMinutes(bedTime, wakeTime);
  }, [bedTime, wakeTime]);

  const formattedDuration = useMemo(() => {
    return formatDurationHoursMinutes(calculatedMinutes);
  }, [calculatedMinutes]);

  const studyDayNumber = useMemo(() => {
    return getStudyDayNumber(logDate, config.startDate);
  }, [logDate, config.startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Date validation
    if (!logDate) {
      setErrorMessage("Please select a date for this sleep entry.");
      return;
    }
    if (!isDateWithinStudy(logDate, config)) {
      setErrorMessage(
        `The selected date must be within the study period (${config.startDate} to ${config.endDate}).`
      );
      return;
    }

    // Time validation
    if (!bedTime || !wakeTime) {
      setErrorMessage("Please specify both bed time and wake time.");
      return;
    }

    if (calculatedMinutes <= 0) {
      setErrorMessage("Calculated sleep duration must be greater than 0 minutes.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await upsertSleepLog({
        id: existingLogId || undefined,
        participant_id: participantId,
        log_date: logDate,
        bed_time: bedTime,
        wake_time: wakeTime,
        total_sleep_minutes: calculatedMinutes,
        sleep_quality: null,
        notes: null,
      });

      if (error || !data) {
        setErrorMessage(error || "Unable to save your entry. Please check your connection and try again.");
      } else {
        setSuccessMessage(
          existingLogId
            ? "✓ Sleep entry updated successfully"
            : "✓ Sleep entry saved successfully"
        );
        if (onSuccess) {
          onSuccess(data);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while saving your entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Form Header Banner */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            {existingLogId ? <Edit3 className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {existingLogId ? "Edit Sleep Entry" : "Daily Sleep Entry"}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                Day {studyDayNumber > 0 ? studyDayNumber : 1}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {existingLogId
                ? "Existing record found for this date. Updates will replace current values."
                : "Record your bed time and wake time."}
            </p>
          </div>
        </div>

        {existingLogId && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Editing Existing Record
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="px-5 pt-4">
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold">Unable to save: </strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
        {/* 1. Date Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Study Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              id="log-date-input"
              value={logDate}
              min={config.startDate}
              max={config.endDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Allowed study period: {config.startDate} through {config.endDate} ({config.targetDays} days).
          </p>
        </div>

        {/* 2. Bed Time and Wake Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bed Time */}
          <div className="bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200 mb-1.5 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Bed Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              id="bed-time-input"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Displays as: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{formatTime12Hour(bedTime)}</span>
            </p>
          </div>

          {/* Wake Time */}
          <div className="bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200 mb-1.5 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              Wake Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              id="wake-time-input"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Displays as: <span className="text-amber-600 dark:text-amber-400 font-semibold">{formatTime12Hour(wakeTime)}</span>
            </p>
          </div>
        </div>

        {/* 3. Real-Time Sleep Duration Banner (Handles Overnight Transitions) */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 dark:from-indigo-950/40 dark:via-slate-850 dark:to-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Calculated Sleep Duration
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {formatTime12Hour(bedTime)} → {formatTime12Hour(wakeTime)} (Overnight auto-handled)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
              {formattedDuration}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1.5">
              ({calculatedMinutes} mins)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200/80 dark:border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            id="save-sleep-entry-btn"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{existingLogId ? "Update Sleep Entry" : "Save Sleep Entry"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
