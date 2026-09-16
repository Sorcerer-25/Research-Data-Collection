"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SleepLog } from "@/types";
import { getParticipantLogs } from "@/lib/supabase/client";
import { getStudyConfig, getStudyDayNumber, isDateWithinStudy } from "@/lib/study-config";
import StudyProgress from "@/components/StudyProgress";
import SleepForm from "@/components/SleepForm";
import SleepHistoryList from "@/components/SleepHistoryList";
import {
  Moon,
  PlusCircle,
  Clock,
  Sparkles,
  Calendar,
  LogOut,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

function ParticipantDashboardContent() {
  const { user, role, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isParticipantPreview = searchParams.get("view") === "participant";

  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [showLogForm, setShowLogForm] = useState<boolean>(false);
  const [selectedFormDate, setSelectedFormDate] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"history" | "form">("history");

  const fetchLogs = useCallback(async (participantId: string) => {
    setIsLoadingLogs(true);
    const data = await getParticipantLogs(participantId);
    setLogs(data);
    setIsLoadingLogs(false);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (role === "admin" && !isParticipantPreview) {
        // Admin default view is the Admin Console
        router.push("/admin");
      } else {
        fetchLogs(user.id);
      }
    }
  }, [user, role, authLoading, router, fetchLogs, isParticipantPreview]);

  if (authLoading || (!user && isLoadingLogs)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">Loading your sleep study data...</p>
      </div>
    );
  }

  if (!user) return null;
  if (role === "admin" && !isParticipantPreview) return null;

  // Check if today is already logged
  const todayStr = new Date().toISOString().split("T")[0];
  const isTodayLogged = logs.some((l) => l.log_date === todayStr);
  const firstName = user.full_name.split(" ")[0] || "Participant";

  // Determine participant's dynamic start date (earliest log date, registration date, or today)
  const participantStartDate = React.useMemo(() => {
    if (logs.length > 0) {
      const sortedDates = [...logs].map((l) => l.log_date).sort();
      return sortedDates[0];
    }
    if (user?.created_at) {
      return user.created_at.split("T")[0];
    }
    return getStudyConfig().startDate;
  }, [logs, user]);

  const config = React.useMemo(() => getStudyConfig(participantStartDate), [participantStartDate]);

  const scrollToForm = () => {
    setTimeout(() => {
      const formEl = document.getElementById("sleep-form-section");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const handleOpenFormForDate = (dateStr: string) => {
    setSelectedFormDate(dateStr);
    setShowLogForm(true);
    scrollToForm();
  };

  const handleEditLog = (log: SleepLog) => {
    setSelectedFormDate(log.log_date);
    setShowLogForm(true);
    scrollToForm();
  };

  const handleFormSuccess = (savedLog: SleepLog) => {
    fetchLogs(user.id);
    setShowLogForm(false);
    setSelectedFormDate(undefined);
    // Smoothly scroll to the progress calendar to view updated completion status
    setTimeout(() => {
      const progressEl = document.getElementById("study-progress-section");
      if (progressEl) {
        progressEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 1. Participant Greeting & Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] sm:text-xs font-medium text-indigo-200 border border-white/10">
              <Moon className="w-3 h-3 fill-indigo-300 text-indigo-200" />
              {config.studyName}
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Hello, {firstName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-lg">
              Welcome back. Please record your sleep details every morning upon waking.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                if (!showLogForm) {
                  setSelectedFormDate(undefined);
                  setShowLogForm(true);
                  scrollToForm();
                } else {
                  setShowLogForm(false);
                }
              }}
              id="log-sleep-cta-btn"
              className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{isTodayLogged ? "Edit Today's Sleep" : "Log Today's Sleep"}</span>
            </button>
            {isTodayLogged && (
              <span className="text-[11px] text-emerald-300 font-medium flex items-center justify-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Today's sleep is recorded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Study Progress Component */}
      <div id="study-progress-section" className="scroll-mt-20">
        <StudyProgress config={config} logs={logs} onSelectDate={handleOpenFormForDate} />
      </div>

      {/* 3. Sleep Entry Form (Toggleable / Clickable) */}
      {showLogForm && (
        <div id="sleep-form-section" className="scroll-mt-20">
          <SleepForm
            config={config}
            participantId={user.id}
            existingLogs={logs}
            initialDate={selectedFormDate}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowLogForm(false)}
          />
        </div>
      )}

      {/* 4. Sleep History List */}
      <SleepHistoryList
        config={config}
        logs={logs}
        onEditLog={handleEditLog}
        onRefresh={() => fetchLogs(user.id)}
      />
    </div>
  );
}

export default function ParticipantDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">Loading your sleep study data...</p>
        </div>
      }
    >
      <ParticipantDashboardContent />
    </Suspense>
  );
}
