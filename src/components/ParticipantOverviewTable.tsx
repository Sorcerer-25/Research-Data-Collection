"use client";

import React, { useState, useMemo } from "react";
import { ParticipantSummary, SleepLog } from "@/types";
import {
  formatDateDisplay,
  formatDurationHoursMinutes,
  formatTime12Hour,
} from "@/lib/sleep-calculations";
import { getStudyConfig, getStudyDayNumber } from "@/lib/study-config";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Filter,
  Layers,
  Calendar,
  ShieldCheck,
} from "lucide-react";

interface ParticipantOverviewTableProps {
  summaries: ParticipantSummary[];
  allLogs?: SleepLog[];
}

export default function ParticipantOverviewTable({
  summaries,
  allLogs = [],
}: ParticipantOverviewTableProps) {
  const config = getStudyConfig();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [durationFilter, setDurationFilter] = useState<"all" | "short" | "long" | "mid">("all");
  const [sortField, setSortField] = useState<"name" | "days" | "duration">("days");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(summaries.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Duration Filter & Search logic
  const filteredSummaries = useMemo(() => {
    return summaries
      .filter((p) => {
        // Search filter
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          p.full_name.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        // Sleep Duration Filter (< 5h = < 300 min, > 7h = > 420 min, 5-7h = 300-420 min)
        if (durationFilter === "short") {
          // Less than 5 hours (300 mins) and has logged at least 1 day
          return p.completed_days > 0 && p.average_sleep_minutes < 300;
        }
        if (durationFilter === "long") {
          // Greater than 7 hours (420 mins) and has logged at least 1 day
          return p.completed_days > 0 && p.average_sleep_minutes > 420;
        }
        if (durationFilter === "mid") {
          // 5 to 7 hours
          return (
            p.completed_days > 0 &&
            p.average_sleep_minutes >= 300 &&
            p.average_sleep_minutes <= 420
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === "name") {
          return sortDirection === "asc"
            ? a.full_name.localeCompare(b.full_name)
            : b.full_name.localeCompare(a.full_name);
        }
        if (sortField === "days") {
          return sortDirection === "asc"
            ? a.completed_days - b.completed_days
            : b.completed_days - a.completed_days;
        }
        if (sortField === "duration") {
          return sortDirection === "asc"
            ? a.average_sleep_minutes - b.average_sleep_minutes
            : b.average_sleep_minutes - a.average_sleep_minutes;
        }
        return 0;
      });
  }, [summaries, searchTerm, durationFilter, sortField, sortDirection]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* 1. Header with Search & Sleep Duration Filter Toggles */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Study Participants & Audit Log</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredSummaries.length} {filteredSummaries.length === 1 ? "person" : "people"}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click on any row to expand and inspect full daily sleep records and date-wise timings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandedIds.size > 0 ? collapseAll : expandAll}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              {expandedIds.size > 0 ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by participant name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Sleep Duration Filter Toggles */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-750">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Duration:
            </span>
            <button
              onClick={() => setDurationFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                durationFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDurationFilter("short")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                durationFilter === "short"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              }`}
              title="Participants with Average Sleep < 5 Hours"
            >
              <span>&lt; 5 hrs</span>
            </button>
            <button
              onClick={() => setDurationFilter("mid")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                durationFilter === "mid"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              }`}
              title="Participants with Average Sleep between 5 and 7 Hours"
            >
              <span>5–7 hrs</span>
            </button>
            <button
              onClick={() => setDurationFilter("long")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                durationFilter === "long"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
              title="Participants with Average Sleep > 7 Hours"
            >
              <span>&gt; 7 hrs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Unified Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
            <tr>
              <th
                onClick={() => {
                  setSortField("name");
                  setSortDirection(sortField === "name" && sortDirection === "desc" ? "asc" : "desc");
                }}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Participant / Role
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Email</th>
              <th
                onClick={() => {
                  setSortField("days");
                  setSortDirection(sortField === "days" && sortDirection === "desc" ? "asc" : "desc");
                }}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Completed Days
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => {
                  setSortField("duration");
                  setSortDirection(sortField === "duration" && sortDirection === "desc" ? "asc" : "desc");
                }}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Avg Duration
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {filteredSummaries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No participants found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search query or sleep duration filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSummaries.map((p) => {
                const isExpanded = expandedIds.has(p.id);
                const participantLogs: SleepLog[] = p.logs || allLogs.filter((l) => l.participant_id === p.id);
                const isComplete = p.completed_days >= p.expected_days;
                const isAdmin = p.role === "admin";
                
                // Start date for day numbering
                const pStart = participantLogs.length > 0
                  ? [...participantLogs].map((l) => l.log_date).sort()[0]
                  : config.startDate;

                return (
                  <React.Fragment key={p.id}>
                    {/* Main Participant Row */}
                    <tr
                      onClick={() => toggleExpand(p.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded
                          ? "bg-indigo-50/50 dark:bg-indigo-950/30 font-medium"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Name & Role */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {p.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {p.full_name}
                              </span>
                              {isAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {p.email}
                      </td>

                      {/* Completed Days Counter (X / 14) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isComplete ? "bg-emerald-500" : "bg-indigo-600"
                              }`}
                              style={{ width: `${Math.max(4, p.completion_percentage)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {p.completed_days} / {p.expected_days} days
                          </span>
                        </div>
                      </td>

                      {/* Person's Average Duration */}
                      <td className="py-3.5 px-4">
                        {p.completed_days > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-black ${
                                p.average_sleep_minutes < 300
                                  ? "text-rose-600 dark:text-rose-400"
                                  : p.average_sleep_minutes > 420
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-indigo-600 dark:text-indigo-400"
                              }`}
                            >
                              {p.average_sleep_formatted}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              ({p.average_sleep_minutes}m)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No entries</span>
                        )}
                      </td>

                      {/* Expand/Collapse Chevron */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 p-1 rounded-lg"
                        >
                          <span className="hidden sm:inline">
                            {isExpanded ? "Hide" : "View"} ({participantLogs.length})
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Accordion Content (Date-wise sleep records) */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 dark:bg-slate-950/40">
                        <td colSpan={5} className="p-4 sm:p-5 border-y border-indigo-100 dark:border-indigo-950">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Daily Protocol Logs for {p.full_name}</span>
                              </h4>
                              <span className="text-xs font-medium text-slate-500">
                                {participantLogs.length} of {p.expected_days} entries recorded
                              </span>
                            </div>

                            {participantLogs.length === 0 ? (
                              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                                No sleep entries recorded yet by this participant.
                              </div>
                            ) : (
                              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750 text-[10px]">
                                    <tr>
                                      <th className="py-2.5 px-3">Study Day</th>
                                      <th className="py-2.5 px-3">Log Date</th>
                                      <th className="py-2.5 px-3">Bed Time</th>
                                      <th className="py-2.5 px-3">Wake Time</th>
                                      <th className="py-2.5 px-3">Total Duration</th>
                                      <th className="py-2.5 px-3 text-right">Recorded At</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {participantLogs.map((log) => {
                                      const dayNum = getStudyDayNumber(log.log_date, pStart);
                                      return (
                                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                          <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                                            Day {dayNum > 0 ? dayNum : "-"}
                                          </td>
                                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                            {formatDateDisplay(log.log_date, true)}
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                              <Moon className="w-3 h-3 text-indigo-500 shrink-0" />
                                              {formatTime12Hour(log.bed_time)}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                              <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                                              {formatTime12Hour(log.wake_time)}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatDurationHoursMinutes(log.total_sleep_minutes)}
                                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                                              ({log.total_sleep_minutes}m)
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-slate-400 text-[11px] font-mono">
                                            {log.created_at ? new Date(log.created_at).toLocaleDateString() : "--"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
