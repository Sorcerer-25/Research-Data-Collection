"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AdminStudyData, getAdminStudyData } from "@/lib/supabase/client";
import { getStudyConfig } from "@/lib/study-config";
import AdminStatsCards from "@/components/AdminStatsCards";
import ParticipantOverviewTable from "@/components/ParticipantOverviewTable";
import {
  ShieldCheck,
  RefreshCw,
  Loader2,
  FileSpreadsheet,
  AlertOctagon,
} from "lucide-react";
import { exportStudyDataToExcel } from "@/lib/excel-export";

export default function AdminDashboardPage() {
  const { user, role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const config = getStudyConfig();

  const [adminData, setAdminData] = useState<AdminStudyData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    const data = await getAdminStudyData();
    setAdminData(data);
    setIsLoadingData(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (role !== "admin") {
        // Participant trying to access admin
      } else {
        fetchData();
      }
    }
  }, [user, role, authLoading, router, fetchData]);

  if (authLoading || (isLoadingData && !adminData)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Clinical Study Administration Console...</p>
      </div>
    );
  }

  // Unauthorized non-admin view
  if (user && role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full p-8 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your account ({user.email}) has the role <strong className="text-slate-800 dark:text-slate-200">Participant</strong>. Only verified research investigators and administrators can view study-wide aggregates and participant logs.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Return to My Participant Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!adminData) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Admin Header & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Researcher Study Administration
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {config.studyName} • {config.targetDays}-Day Research Protocol
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => exportStudyDataToExcel(adminData)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Study (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. Single Key Metric Card: Total Participants Providing Data */}
      <AdminStatsCards stats={adminData.stats} />

      {/* 3. Unified Audit Log & Participant Records Table */}
      <ParticipantOverviewTable
        summaries={adminData.participantSummaries}
        allLogs={adminData.logs}
      />
    </div>
  );
}
