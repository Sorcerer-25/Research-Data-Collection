"use client";

import React from "react";
import Link from "next/link";
import { SleepLog } from "@/types";
import { getAllStudyDays, getStudyConfig, getStudyDayNumber } from "@/lib/study-config";
import { CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";

interface StudyProgressProps {
  logs: SleepLog[];
  onSelectDate?: (dateStr: string) => void;
}

export default function StudyProgress({ logs, onSelectDate }: StudyProgressProps) {
  const config = getStudyConfig();
  const allDays = getAllStudyDays(config);
  
  const completedLogDates = new Set(logs.map((l) => l.log_date));
  const completedCount = logs.length;
  const targetCount = config.targetDays;
  const completionPercentage = Math.min(100, Math.round((completedCount / targetCount) * 100));

  // Determine current study day based on today's date
  const todayStr = new Date().toISOString().split("T")[0];
  const currentDayNum = getStudyDayNumber(todayStr, config.startDate);
  const currentDayDisplay = currentDayNum > 0 && currentDayNum <= targetCount
    ? `Day ${currentDayNum} of ${targetCount}`
    : currentDayNum > targetCount
    ? `Study Completed (${targetCount} days)`
    : `Starting Soon`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Study Progress
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
              {currentDayDisplay}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log your sleep daily throughout the {config.targetDays}-day protocol.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {completedCount}
            </span>
            <span className="text-sm font-medium text-slate-400"> / {targetCount} days</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-100 dark:border-indigo-900">
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden mb-6 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
        <div
          className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(5, completionPercentage)}%` }}
        />
      </div>

      {/* 14-Day Visual Tracker Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Daily Tracker</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Logged
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Circle className="w-3.5 h-3.5" /> Pending
            </span>
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-7 lg:grid-cols-14 gap-2">
          {allDays.map((day) => {
            const isCompleted = completedLogDates.has(day.dateStr);
            const isToday = day.isToday;

            return (
              <div
                key={day.dayNumber}
                onClick={() => onSelectDate && onSelectDate(day.dateStr)}
                role={onSelectDate ? "button" : undefined}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                  isCompleted
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 shadow-sm"
                    : isToday
                    ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                } ${onSelectDate ? "cursor-pointer hover:scale-105 active:scale-95" : ""}`}
                title={`Day ${day.dayNumber} (${day.dateStr}): ${isCompleted ? "Completed" : "Not logged"}`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isToday ? (
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <span className="text-[11px] font-bold">D{day.dayNumber}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">
                  {day.formattedDate}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {completedCount >= targetCount && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Congratulations!</strong> You have fulfilled the full {targetCount}-day sleep logging requirement for this research study.
          </span>
        </div>
      )}
    </div>
  );
}
