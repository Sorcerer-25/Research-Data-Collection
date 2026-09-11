"use client";

import React from "react";
import { StudyStats } from "@/types";
import { Users, BookOpen, Clock, Activity, CheckCircle, Award } from "lucide-react";

interface AdminStatsCardsProps {
  stats: StudyStats;
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Registered Participants */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enrolled Cohort
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.total_participants}
            </span>
            <span className="text-xs font-semibold text-slate-500">participants</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Active Study Cohort
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Total Sleep Entries & Completion Rate */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Submitted Entries
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.total_entries.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {stats.expected_entries.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {stats.overall_completion_percentage}% Completion
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
          <BookOpen className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Average Sleep Duration */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Avg Sleep
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.average_sleep_formatted}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({stats.average_sleep_minutes}m)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Across all valid logs
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Sleep Quality Rating */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Avg Sleep Quality
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">
              {stats.average_quality !== null ? `${stats.average_quality}` : "N/A"}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 5.0</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            1-5 Likert Scale
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-900">
          <Award className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
