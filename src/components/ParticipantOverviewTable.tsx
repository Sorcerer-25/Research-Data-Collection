"use client";

import React, { useState, useMemo } from "react";
import { ParticipantSummary } from "@/types";
import { Search, Filter, CheckCircle2, AlertTriangle, ArrowUpDown, User } from "lucide-react";

interface ParticipantOverviewTableProps {
  summaries: ParticipantSummary[];
  onSelectParticipant?: (participantId: string) => void;
}

export default function ParticipantOverviewTable({
  summaries,
  onSelectParticipant,
}: ParticipantOverviewTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "incomplete" | "complete">("all");
  const [sortField, setSortField] = useState<keyof ParticipantSummary>("completion_percentage");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filtering & Search
  const filteredSummaries = useMemo(() => {
    return summaries
      .filter((p) => {
        const matchesSearch =
          p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === "incomplete") {
          return p.completed_days < p.expected_days;
        }
        if (statusFilter === "complete") {
          return p.completed_days >= p.expected_days;
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [summaries, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof ParticipantSummary) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Controls & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Participant Study Overview</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring compliance and compliance rates for all {summaries.length} study participants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search participant or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Participants ({summaries.length})</option>
            <option value="incomplete">Missing Entries</option>
            <option value="complete">100% Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th
                onClick={() => handleSort("full_name")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Participant Name
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Email</th>
              <th
                onClick={() => handleSort("completed_days")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Completed / Expected
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("completion_percentage")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Completion %
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("average_sleep_minutes")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Avg Sleep Duration
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {filteredSummaries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No participants matched the filter criteria.
                </td>
              </tr>
            ) : (
              filteredSummaries.map((p) => {
                const isComplete = p.completed_days >= p.expected_days;
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectParticipant && onSelectParticipant(p.id)}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      onSelectParticipant ? "cursor-pointer" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {p.full_name.charAt(0)}
                        </div>
                        <span>{p.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {p.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {p.completed_days}
                      </span>
                      <span className="text-slate-400"> / {p.expected_days} days</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isComplete ? "bg-emerald-500" : "bg-indigo-600"
                            }`}
                            style={{ width: `${p.completion_percentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs">{p.completion_percentage}%</span>
                        {isComplete ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span
                            title={`${p.expected_days - p.completed_days} days missing`}
                            className="inline-flex text-[10px] font-bold text-amber-600 dark:text-amber-400"
                          >
                            (-{p.expected_days - p.completed_days}d)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {p.average_sleep_formatted}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        ({p.average_sleep_minutes}m)
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
