"use client";

import React from "react";
import { StudyStats } from "@/types";
import { Users, BookOpen, Clock, Activity, CheckCircle, Award } from "lucide-react";

interface AdminStatsCardsProps {
  stats: StudyStats;
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="w-full">
      {/* Single Key Metric: Total Participants Providing Data */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Participation Status
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.active_participants_count}
            </span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Participants Providing Data
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.active_participants_count} active data {stats.active_participants_count === 1 ? "contributor" : "contributors"} out of {stats.total_participants} enrolled study {stats.total_participants === 1 ? "participant" : "participants"} (admins excluded)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
