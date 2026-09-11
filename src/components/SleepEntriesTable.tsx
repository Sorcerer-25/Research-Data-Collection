"use client";

import React, { useState, useMemo } from "react";
import { SleepLog, Participant } from "@/types";
import {
  formatDateDisplay,
  formatDurationHoursMinutes,
  formatTime12Hour,
  SLEEP_QUALITY_LABELS,
} from "@/lib/sleep-calculations";
import { getStudyConfig, getStudyDayNumber } from "@/lib/study-config";
import { exportStudyDataToExcel } from "@/lib/excel-export";
import { AdminStudyData } from "@/lib/supabase/client";
import {
  Search,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Moon,
  Sun,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

interface SleepEntriesTableProps {
  adminData: AdminStudyData;
  initialSelectedParticipantId?: string;
}

export default function SleepEntriesTable({
  adminData,
  initialSelectedParticipantId,
}: SleepEntriesTableProps) {
  const config = getStudyConfig();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [participantFilter, setParticipantFilter] = useState<string>(
    initialSelectedParticipantId || "all"
  );
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "longest" | "shortest">("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter and sort the logs
  const filteredLogs = useMemo(() => {
    return adminData.logs
      .filter((log) => {
        const participant = adminData.participants.find((p) => p.id === log.participant_id) || {
          full_name: log.participant?.full_name || "",
          email: log.participant?.email || "",
        };

        // Participant filter
        if (participantFilter !== "all" && log.participant_id !== participantFilter) {
          return false;
        }

        // Date range filter
        if (startDateFilter && log.log_date < startDateFilter) return false;
        if (endDateFilter && log.log_date > endDateFilter) return false;

        // Search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchName = participant.full_name.toLowerCase().includes(term);
          const matchEmail = participant.email.toLowerCase().includes(term);
          const matchNotes = (log.notes || "").toLowerCase().includes(term);
          const matchDate = log.log_date.includes(term);
          if (!matchName && !matchEmail && !matchNotes && !matchDate) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.log_date.localeCompare(a.log_date);
        if (sortBy === "oldest") return a.log_date.localeCompare(b.log_date);
        if (sortBy === "longest") return b.total_sleep_minutes - a.total_sleep_minutes;
        if (sortBy === "shortest") return a.total_sleep_minutes - b.total_sleep_minutes;
        return 0;
      });
  }, [
    adminData.logs,
    adminData.participants,
    participantFilter,
    startDateFilter,
    endDateFilter,
    searchTerm,
    sortBy,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIdx, startIdx + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handleExcelExport = async () => {
    setIsExporting(true);
    try {
      await exportStudyDataToExcel(adminData);
    } catch (e) {
      console.error("Export error:", e);
      alert("Failed to export Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header & Excel Export CTA */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Daily Sleep Entries Audit Log
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredLogs.length} matching
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full audit log of individual daily sleep records with timestamps and quality ratings.
          </p>
        </div>

        {/* Download Excel Button */}
        <button
          onClick={handleExcelExport}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Excel...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/60 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search participant / notes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Filter by Participant */}
        <div>
          <select
            value={participantFilter}
            onChange={(e) => {
              setParticipantFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="all">All Participants ({adminData.participants.filter(p => p.role === "participant").length})</option>
            {adminData.participants
              .filter((p) => p.role === "participant")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.email})
                </option>
              ))}
          </select>
        </div>

        {/* Date From */}
        <div className="relative">
          <input
            type="date"
            placeholder="Start Date"
            value={startDateFilter}
            onChange={(e) => {
              setStartDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <input
            type="date"
            placeholder="End Date"
            value={endDateFilter}
            onChange={(e) => {
              setEndDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Sort Options */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="newest">Sort: Newest Date First</option>
            <option value="oldest">Sort: Oldest Date First</option>
            <option value="longest">Sort: Longest Duration</option>
            <option value="shortest">Sort: Shortest Duration</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Study Day / Date</th>
              <th className="py-3 px-4">Bed Time</th>
              <th className="py-3 px-4">Wake Time</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Sleep Quality</th>
              <th className="py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No sleep log records found.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const participant = adminData.participants.find((p) => p.id === log.participant_id) || {
                  full_name: log.participant?.full_name || "Unknown",
                  email: log.participant?.email || "Unknown",
                };
                const dayNum = getStudyDayNumber(log.log_date, config.startDate);
                const qualityInfo = log.sleep_quality ? SLEEP_QUALITY_LABELS[log.sleep_quality] : null;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {participant.full_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {participant.email}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatDateDisplay(log.log_date, true)}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Day {dayNum > 0 ? dayNum : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Moon className="w-3 h-3 text-indigo-500" />
                        {formatTime12Hour(log.bed_time)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Sun className="w-3 h-3 text-amber-500" />
                        {formatTime12Hour(log.wake_time)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {formatDurationHoursMinutes(log.total_sleep_minutes)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        ({log.total_sleep_minutes}m)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {qualityInfo ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${qualityInfo.bg} ${qualityInfo.color}`}
                        >
                          ★ {log.sleep_quality} - {qualityInfo.label}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.notes || ""}>
                      {log.notes || "--"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}–
            {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
