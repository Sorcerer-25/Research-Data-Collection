"use client";

import React from "react";
import Link from "next/link";
import { SleepLog } from "@/types";
import { getAllStudyDays, getStudyConfig, getStudyDayNumber, getTodayDateStr, StudyConfig } from "@/lib/study-config";
import { CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";

interface StudyProgressProps {
  logs: SleepLog[];
  config?: StudyConfig;
  onSelectDate?: (dateStr: string) => void;
}

export default function StudyProgress({ logs, config: propConfig, onSelectDate }: StudyProgressProps) {
  const defaultStartDate = logs.length > 0 ? [...logs].map((l) => l.log_date).sort()[0] : undefined;
  const config = propConfig || getStudyConfig(defaultStartDate);
  const allDays = getAllStudyDays(config);
  
  const completedLogDates = new Set(logs.map((l) => l.log_date));
  const completedCount = logs.length;
  const targetCount = config.targetDays;
  const completionPercentage = Math.min(100, Math.round((completedCount / targetCount) * 100));

  // Determine current study day based on today's date
  const todayStr = getTodayDateStr();
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
          <span className="font-semibold text-slate-700 dark:text-slate-300">Daily Protocol Tracker</span>
          <span className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Logged
            </span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <Clock className="w-3.5 h-3.5" /> Today
            </span>
            <span className="flex items-center gap-1 text-slate-400 hidden min-[400px]:inline-flex">
              <Circle className="w-3.5 h-3.5" /> Pending
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-7 lg:grid-cols-7 gap-2 sm:gap-2">
          {allDays.map((day) => {
            const isCompleted = completedLogDates.has(day.dateStr);
            const isToday = day.isToday;
            const isFuture = day.isFuture;
            const canClick = !isFuture && !!onSelectDate;

            let titleText = `Day ${day.dayNumber} (${day.dateStr})`;
            if (isCompleted) {
              titleText += ": Completed (click to view/edit)";
            } else if (isToday) {
              titleText += ": Today (click to log sleep)";
            } else if (isFuture) {
              titleText += ": Upcoming (future date)";
            } else {
              titleText += ": Pending (click to log past entry)";
            }

            return (
              <div
                key={day.dayNumber}
                onClick={() => canClick && onSelectDate(day.dateStr)}
                role={canClick ? "button" : undefined}
                className={`flex flex-col justify-between p-2.5 sm:p-2 rounded-xl text-left sm:text-center border transition-all select-none min-h-[68px] sm:min-h-[64px] ${
                  isCompleted
                    ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 shadow-sm"
                    : isToday
                    ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                    : isFuture
                    ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                } ${canClick ? "cursor-pointer hover:scale-[1.02] sm:hover:scale-105 active:scale-95" : ""}`}
                title={titleText}
              >
                {/* Card Top: Day label & Status Icon */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold tracking-tight text-slate-900 dark:text-white">
                    Day {day.dayNumber}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isToday ? (
                    <Clock className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                </div>

                {/* Card Bottom: Date & Mobile status */}
                <div className="mt-1">
                  <div className="text-xs sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    {day.formattedDate}
                  </div>
                  <div className="text-[10px] font-medium mt-0.5 sm:hidden">
                    {isCompleted ? (
                      <span className="text-emerald-700 dark:text-emerald-400">✓ Logged</span>
                    ) : isToday ? (
                      <span className="text-indigo-600 dark:text-indigo-400">● Today</span>
                    ) : isFuture ? (
                      <span className="text-slate-400">Upcoming</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">○ Pending</span>
                    )}
                  </div>
                </div>
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
