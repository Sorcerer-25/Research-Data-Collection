"use client";

import React, { useState } from "react";
import { SleepLog } from "@/types";
import {
  formatDateDisplay,
  formatDurationHoursMinutes,
  formatTime12Hour,
} from "@/lib/sleep-calculations";
import { getStudyConfig, getStudyDayNumber, StudyConfig } from "@/lib/study-config";
import { deleteSleepLog } from "@/lib/supabase/client";
import {
  Edit2,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";

interface SleepHistoryListProps {
  logs: SleepLog[];
  config?: StudyConfig;
  onEditLog: (log: SleepLog) => void;
  onRefresh: () => void;
}

export default function SleepHistoryList({
  logs,
  config: propConfig,
  onEditLog,
  onRefresh,
}: SleepHistoryListProps) {
  const defaultStartDate = logs.length > 0 ? [...logs].map((l) => l.log_date).sort()[0] : undefined;
  const config = propConfig || getStudyConfig(defaultStartDate);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to remove this sleep entry?")) return;

    setDeletingId(logId);
    await deleteSleepLog(logId);
    setDeletingId(null);
    onRefresh();
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Moon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Sleep Entries Yet</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          You haven't recorded any sleep data for this study yet. Tap "Log Today's Sleep" above to begin your 14-day protocol.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table / List Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Sleep History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {logs.length} {logs.length === 1 ? "entry" : "entries"} recorded • Sorted newest first
          </p>
        </div>
      </div>

      {/* Responsive Table for Tablet/Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Date / Study Day</th>
              <th className="py-3.5 px-4">Bed Time</th>
              <th className="py-3.5 px-4">Wake Time</th>
              <th className="py-3.5 px-4">Sleep Duration</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {logs.map((log) => {
              const dayNum = getStudyDayNumber(log.log_date, config.startDate);

              return (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span>{formatDateDisplay(log.log_date, true)}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Day {dayNum > 0 ? dayNum : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      {formatTime12Hour(log.bed_time)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      {formatTime12Hour(log.wake_time)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatDurationHoursMinutes(log.total_sleep_minutes)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditLog(log)}
                        title="Edit Entry"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        title="Delete Entry"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-slate-200/80 dark:divide-slate-800">
        {logs.map((log) => {
          const dayNum = getStudyDayNumber(log.log_date, config.startDate);

          return (
            <div key={log.id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatDateDisplay(log.log_date, true)}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Day {dayNum > 0 ? dayNum : "-"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditLog(log)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time & Duration row */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Bed</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatTime12Hour(log.bed_time)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Wake</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatTime12Hour(log.wake_time)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Duration</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {formatDurationHoursMinutes(log.total_sleep_minutes)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
