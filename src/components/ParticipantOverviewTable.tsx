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
  ArrowUpDown,
  Calendar,
  ShieldCheck,
  Users,
  Shield,
  UserCheck,
  X,
  Filter,
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
  const [activeTab, setActiveTab] = useState<"participants" | "admins">("participants");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [durationFilter, setDurationFilter] = useState<"all" | "short" | "long" | "mid">("all");
  const [sortField, setSortField] = useState<"name" | "days" | "duration">("days");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Split summaries into participants and administrators
  const participantList = useMemo(() => summaries.filter((p) => p.role !== "admin"), [summaries]);
  const adminList = useMemo(() => summaries.filter((p) => p.role === "admin"), [summaries]);

  // Count participants in each duration category across the whole participant list
  const durationCounts = useMemo(() => {
    let short = 0;
    let mid = 0;
    let long = 0;
    let noData = 0;

    participantList.forEach((p) => {
      if (p.completed_days === 0) {
        noData++;
      } else if (p.average_sleep_minutes < 360) {
        short++;
      } else if (p.average_sleep_minutes > 420) {
        long++;
      } else {
        mid++;
      }
    });

    return {
      all: participantList.length,
      short,
      mid,
      long,
      noData,
    };
  }, [participantList]);

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

  const expandAll = (list: ParticipantSummary[]) => {
    setExpandedIds(new Set(list.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Duration Filter & Search logic for Participants
  const filteredParticipants = useMemo(() => {
    return participantList
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          p.full_name.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        // Sleep Duration Filter (< 6h = < 360 min, > 7h = > 420 min, 6-7h = 360-420 min)
        if (durationFilter === "short") {
          return p.completed_days > 0 && p.average_sleep_minutes < 360;
        }
        if (durationFilter === "long") {
          return p.completed_days > 0 && p.average_sleep_minutes > 420;
        }
        if (durationFilter === "mid") {
          return (
            p.completed_days > 0 &&
            p.average_sleep_minutes >= 360 &&
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
  }, [participantList, searchTerm, durationFilter, sortField, sortDirection]);

  // Search logic for Admins
  const filteredAdmins = useMemo(() => {
    return adminList.filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    });
  }, [adminList, searchTerm]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* 1. View Switcher Tabs: Participants vs Admins */}
      <div className="px-5 pt-4 pb-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("participants");
              setSearchTerm("");
              setExpandedIds(new Set());
            }}
            className={`pb-3.5 px-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "participants"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Study Participants</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "participants"
                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {durationFilter !== "all" || searchTerm
                ? `${filteredParticipants.length} of ${participantList.length}`
                : participantList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("admins");
              setSearchTerm("");
              setExpandedIds(new Set());
            }}
            className={`pb-3.5 px-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "admins"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Research Administrators</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "admins"
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {adminList.length}
            </span>
          </button>
        </div>

        {/* Global Expand/Collapse */}
        <div className="pb-3 hidden sm:block">
          <button
            onClick={
              expandedIds.size > 0
                ? collapseAll
                : () => expandAll(activeTab === "participants" ? filteredParticipants : filteredAdmins)
            }
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            {expandedIds.size > 0 ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      {/* 2. Controls Bar: Search & Duration Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "participants"
                  ? "Search participant by name or email..."
                  : "Search administrator by name or email..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Sleep Duration Filter Toggles with Counts (Participants Tab Only) */}
          {activeTab === "participants" && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-750">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration Filter:
              </span>
              <button
                onClick={() => setDurationFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  durationFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>All</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    durationFilter === "all"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      : "bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {durationCounts.all}
                </span>
              </button>
              <button
                onClick={() => setDurationFilter("short")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  durationFilter === "short"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                }`}
                title={`Participants with Average Sleep < 6 Hours (${durationCounts.short} participants)`}
              >
                <span>&lt; 6 hrs</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    durationFilter === "short"
                      ? "bg-rose-700/90 text-white"
                      : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {durationCounts.short}
                </span>
              </button>
              <button
                onClick={() => setDurationFilter("mid")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  durationFilter === "mid"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                }`}
                title={`Participants with Average Sleep between 6 and 7 Hours (${durationCounts.mid} participants)`}
              >
                <span>6–7 hrs</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    durationFilter === "mid"
                      ? "bg-indigo-700/90 text-white"
                      : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  }`}
                >
                  {durationCounts.mid}
                </span>
              </button>
              <button
                onClick={() => setDurationFilter("long")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  durationFilter === "long"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                }`}
                title={`Participants with Average Sleep > 7 Hours (${durationCounts.long} participants)`}
              >
                <span>&gt; 7 hrs</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    durationFilter === "long"
                      ? "bg-emerald-700/90 text-white"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {durationCounts.long}
                </span>
              </button>
            </div>
          )}

          {activeTab === "admins" && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>System administrators are excluded from research participant metrics.</span>
            </div>
          )}
        </div>

        {/* Dynamic Filter / Count Status Summary Bar */}
        {activeTab === "participants" && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {filteredParticipants.length === 1
                  ? "1 participant found"
                  : `${filteredParticipants.length} participants found`}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                Total enrolled: <strong className="text-slate-700 dark:text-slate-300">{participantList.length}</strong> (admins excluded)
              </span>

              {durationFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <span>
                    Avg Sleep Filter: {durationFilter === "short" ? "< 6 hrs" : durationFilter === "mid" ? "6–7 hrs" : "> 7 hrs"} ({filteredParticipants.length} {filteredParticipants.length === 1 ? "person" : "people"})
                  </span>
                  <button
                    onClick={() => setDurationFilter("all")}
                    className="hover:text-indigo-900 dark:hover:text-white p-0.5 rounded"
                    title="Clear duration filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span>Search: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-slate-900 dark:hover:text-white p-0.5 rounded"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {(durationFilter !== "all" || searchTerm) && (
              <button
                onClick={() => {
                  setDurationFilter("all");
                  setSearchTerm("");
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold underline underline-offset-2"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Tables Content */}
      {activeTab === "participants" ? (
        /* =================== TAB 1: PARTICIPANTS TABLE =================== */
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
                    Participant Name
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
                    Avg Sleep Duration &amp; Day Ratios
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredParticipants.length === 0 ? (
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
                filteredParticipants.map((p) => {
                  const isExpanded = expandedIds.has(p.id);
                  const participantLogs: SleepLog[] = p.logs || allLogs.filter((l) => l.participant_id === p.id);
                  const isComplete = p.completed_days >= p.expected_days;
                  const totalLogs = participantLogs.length;

                  // Compute count of days meeting each duration threshold for this participant
                  const daysUnder6 = participantLogs.filter((l) => l.total_sleep_minutes < 360).length;
                  const daysBetween6And7 = participantLogs.filter(
                    (l) => l.total_sleep_minutes >= 360 && l.total_sleep_minutes <= 420
                  ).length;
                  const daysOver7 = participantLogs.filter((l) => l.total_sleep_minutes > 420).length;

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
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {p.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.full_name}
                            </span>
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

                        {/* Person's Average Duration & Day Ratios */}
                        <td className="py-3.5 px-4">
                          {p.completed_days > 0 ? (
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`font-black text-sm ${
                                    p.average_sleep_minutes < 360
                                      ? "text-rose-600 dark:text-rose-400"
                                      : p.average_sleep_minutes > 420
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-indigo-600 dark:text-indigo-400"
                                  }`}
                                >
                                  {p.average_sleep_formatted}
                                </span>

                                {/* Day Ratio Badge (e.g. 4/7 days < 6h or 5/7 days > 7h) */}
                                {durationFilter === "short" ? (
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                    title={`${daysUnder6} of ${totalLogs} logged days were under 6 hours`}
                                  >
                                    {daysUnder6}/{totalLogs} days &lt; 6h
                                  </span>
                                ) : durationFilter === "long" ? (
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                    title={`${daysOver7} of ${totalLogs} logged days were over 7 hours`}
                                  >
                                    {daysOver7}/{totalLogs} days &gt; 7h
                                  </span>
                                ) : durationFilter === "mid" ? (
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                    title={`${daysBetween6And7} of ${totalLogs} logged days were between 6 and 7 hours`}
                                  >
                                    {daysBetween6And7}/{totalLogs} days 6–7h
                                  </span>
                                ) : (
                                  /* Filter is "All": Show the primary pattern based on participant's average sleep */
                                  p.average_sleep_minutes < 360 ? (
                                    <span
                                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                      title={`${daysUnder6} of ${totalLogs} logged days were under 6 hours`}
                                    >
                                      {daysUnder6}/{totalLogs} days &lt; 6h
                                    </span>
                                  ) : p.average_sleep_minutes > 420 ? (
                                    <span
                                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                      title={`${daysOver7} of ${totalLogs} logged days were over 7 hours`}
                                    >
                                      {daysOver7}/{totalLogs} days &gt; 7h
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                      title={`${daysBetween6And7} of ${totalLogs} logged days were between 6 and 7 hours`}
                                    >
                                      {daysBetween6And7}/{totalLogs} days 6–7h
                                    </span>
                                  )
                                )}
                              </div>

                              {/* Compact Day Breakdown Line */}
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="text-slate-400 dark:text-slate-500 font-normal">Breakdown:</span>
                                <span className={daysUnder6 > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-400 dark:text-slate-500"}>
                                  &lt;6h: {daysUnder6}d
                                </span>
                                <span>•</span>
                                <span className={daysBetween6And7 > 0 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-slate-500"}>
                                  6–7h: {daysBetween6And7}d
                                </span>
                                <span>•</span>
                                <span className={daysOver7 > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400 dark:text-slate-500"}>
                                  &gt;7h: {daysOver7}d
                                </span>
                              </div>
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

                      {/* Expandable Accordion Content */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-950/40">
                          <td colSpan={5} className="p-4 sm:p-5 border-y border-indigo-100 dark:border-indigo-950">
                            <div className="space-y-3.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Daily Protocol Logs for {p.full_name}</span>
                                </h4>
                                <span className="text-xs font-medium text-slate-500">
                                  {participantLogs.length} of {p.expected_days} entries recorded ({p.completion_percentage}% protocol completion)
                                </span>
                              </div>

                              {/* Participant Summary Cards in Accordion */}
                              {participantLogs.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Sleep</span>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{p.average_sleep_formatted}</p>
                                    <span className="text-[10px] text-slate-500">{totalLogs} recorded {totalLogs === 1 ? "day" : "days"}</span>
                                  </div>
                                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">&lt; 6 Hours (Short)</span>
                                    <p className="text-sm font-black text-rose-600 dark:text-rose-400">{daysUnder6} of {totalLogs} days</p>
                                    <span className="text-[10px] text-rose-500">{totalLogs > 0 ? Math.round((daysUnder6 / totalLogs) * 100) : 0}% of logs</span>
                                  </div>
                                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">6–7 Hours (Mid)</span>
                                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{daysBetween6And7} of {totalLogs} days</p>
                                    <span className="text-[10px] text-indigo-500">{totalLogs > 0 ? Math.round((daysBetween6And7 / totalLogs) * 100) : 0}% of logs</span>
                                  </div>
                                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">&gt; 7 Hours (Long)</span>
                                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{daysOver7} of {totalLogs} days</p>
                                    <span className="text-[10px] text-emerald-500">{totalLogs > 0 ? Math.round((daysOver7 / totalLogs) * 100) : 0}% of logs</span>
                                  </div>
                                </div>
                              )}

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
                                            <td className="py-2.5 px-3 font-bold">
                                              <div className="flex items-center gap-2">
                                                <span className="text-slate-900 dark:text-white font-bold">
                                                  {formatDurationHoursMinutes(log.total_sleep_minutes)}
                                                </span>
                                                {log.total_sleep_minutes < 360 ? (
                                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                    &lt; 6 hrs
                                                  </span>
                                                ) : log.total_sleep_minutes > 420 ? (
                                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    &gt; 7 hrs
                                                  </span>
                                                ) : (
                                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                    6–7 hrs
                                                  </span>
                                                )}
                                              </div>
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
      ) : (
        /* =================== TAB 2: RESEARCH ADMINS TABLE =================== */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Test Logs Recorded</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No administrator accounts found</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((p) => {
                  const isExpanded = expandedIds.has(p.id);
                  const adminLogs: SleepLog[] = p.logs || allLogs.filter((l) => l.participant_id === p.id);

                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        onClick={() => toggleExpand(p.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? "bg-amber-50/40 dark:bg-amber-950/20 font-medium"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {p.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {p.full_name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Lead Admin
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                          {p.email}
                        </td>

                        {/* System Role */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                            Research Investigator
                          </span>
                        </td>

                        {/* Test logs count */}
                        <td className="py-3.5 px-4">
                          {adminLogs.length > 0 ? (
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {adminLogs.length} test {adminLogs.length === 1 ? "entry" : "entries"}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">0 test entries</span>
                          )}
                        </td>

                        {/* Expand/Collapse Chevron */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-800 p-1 rounded-lg"
                          >
                            <span className="hidden sm:inline">
                              {isExpanded ? "Hide" : "View"} ({adminLogs.length})
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-amber-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-amber-600" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Admin Expandable Logs */}
                      {isExpanded && (
                        <tr className="bg-amber-50/20 dark:bg-amber-950/10">
                          <td colSpan={5} className="p-4 sm:p-5 border-y border-amber-200/60 dark:border-amber-900/40">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                <span>Test Sleep Logs for {p.full_name} ({p.email})</span>
                              </h4>

                              {adminLogs.length === 0 ? (
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                                  No test entries logged under this administrator account.
                                </div>
                              ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750 text-[10px]">
                                      <tr>
                                        <th className="py-2.5 px-3">Log Date</th>
                                        <th className="py-2.5 px-3">Bed Time</th>
                                        <th className="py-2.5 px-3">Wake Time</th>
                                        <th className="py-2.5 px-3">Total Duration</th>
                                        <th className="py-2.5 px-3 text-right">Recorded At</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {adminLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
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
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-slate-400 text-[11px] font-mono">
                                            {log.created_at ? new Date(log.created_at).toLocaleDateString() : "--"}
                                          </td>
                                        </tr>
                                      ))}
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
      )}
    </div>
  );
}
