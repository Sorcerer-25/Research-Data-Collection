"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function ParticipantDashboard() {
  const { user, role, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const config = getStudyConfig();

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
      } else {
        fetchLogs(user.id);
      }
    }
  }, [user, authLoading, router, fetchLogs]);

  if (authLoading || (!user && isLoadingLogs)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">Loading your sleep study data...</p>
      </div>
    );
  }

  if (!user) return null;

  // Check if today is already logged
  const todayStr = new Date().toISOString().split("T")[0];
  const isTodayLogged = logs.some((l) => l.log_date === todayStr);
  const firstName = user.full_name.split(" ")[0] || "Participant";

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
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 1. Participant Greeting & Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200 border border-white/10">
              <Moon className="w-3.5 h-3.5 fill-indigo-300 text-indigo-200" />
              {config.studyName}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Hello, {firstName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-lg">
              Welcome back to your daily sleep diary. Please record your sleep details every morning upon waking.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
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
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-sm shadow-lg shadow-black/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>{isTodayLogged ? "Edit Today's Sleep" : "Log Today's Sleep"}</span>
            </button>
            {isTodayLogged && (
              <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Today's sleep is recorded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Study Progress Component */}
      <StudyProgress logs={logs} onSelectDate={handleOpenFormForDate} />

      {/* 3. Sleep Entry Form (Toggleable / Clickable) */}
      {showLogForm && (
        <div id="sleep-form-section" className="scroll-mt-20">
          <SleepForm
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
        logs={logs}
        onEditLog={handleEditLog}
        onRefresh={() => fetchLogs(user.id)}
      />
    </div>
  );
}
