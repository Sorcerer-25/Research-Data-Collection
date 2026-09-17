"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SleepLog, AVAILABLE_BATCHES } from "@/types";
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
  GraduationCap,
  Hash,
  Layers,
  Edit3,
  AlertCircle,
  Check,
} from "lucide-react";

function ParticipantDashboardContent() {
  const { user, role, isLoading: authLoading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isParticipantPreview = searchParams.get("view") === "participant";

  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [showLogForm, setShowLogForm] = useState<boolean>(false);
  const [selectedFormDate, setSelectedFormDate] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"history" | "form">("history");

  // Profile Modal State (for Roll No. & Batch No.)
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [rollNumberInput, setRollNumberInput] = useState<string>("");
  const [batchNumberInput, setBatchNumberInput] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (participantId: string) => {
    setIsLoadingLogs(true);
    const data = await getParticipantLogs(participantId);
    setLogs(data);
    setIsLoadingLogs(false);
  }, []);

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

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (role === "admin" && !isParticipantPreview) {
        // Admin default view is the Admin Console
        router.push("/admin");
      } else {
        fetchLogs(user.id);

        // If participant is missing roll number or batch number, prompt them
        if (!user.roll_number || !user.batch_number) {
          setRollNumberInput(user.roll_number || "");
          setBatchNumberInput(user.batch_number || "");
          setShowProfileModal(true);
        }
      }
    }
  }, [user, role, authLoading, router, fetchLogs, isParticipantPreview]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (!rollNumberInput.trim()) {
      setProfileError("Please enter your Roll Number.");
      return;
    }
    if (!batchNumberInput.trim()) {
      setProfileError("Please enter your Batch Number.");
      return;
    }

    setIsSavingProfile(true);
    const result = await updateProfile({
      roll_number: rollNumberInput.trim(),
      batch_number: batchNumberInput.trim(),
    });
    setIsSavingProfile(false);

    if (result.success) {
      setShowProfileModal(false);
    } else {
      setProfileError(result.error || "Failed to save profile. Please try again.");
    }
  };

  const openProfileEditor = () => {
    if (user) {
      setRollNumberInput(user.roll_number || "");
      setBatchNumberInput(user.batch_number || "");
      setProfileError(null);
      setShowProfileModal(true);
    }
  };

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
    if (user) {
      fetchLogs(user.id);
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 1. Participant Greeting & Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] sm:text-xs font-medium text-indigo-200 border border-white/10">
                <Moon className="w-3 h-3 fill-indigo-300 text-indigo-200" />
                {config.studyName}
              </div>

              {/* Roll Number & Batch Number Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-indigo-100 border border-indigo-400/30">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
                <span>Roll: <strong>{user.roll_number || "Not set"}</strong></span>
                <span className="opacity-40">•</span>
                <span>Batch: <strong>{user.batch_number || "Not set"}</strong></span>
                <button
                  onClick={openProfileEditor}
                  title="Edit Roll & Batch Number"
                  className="ml-1 hover:text-white underline text-[10px] opacity-80 hover:opacity-100"
                >
                  Edit
                </button>
              </div>
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

      {/* Profile Details Modal / Prompt (for Roll & Batch Number) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Participant Academic Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please confirm your Roll Number and Batch Number for study research records.
                </p>
              </div>
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Roll Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={rollNumberInput}
                    onChange={(e) => setRollNumberInput(e.target.value)}
                    placeholder="1-250"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Batch <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    required
                    value={batchNumberInput}
                    onChange={(e) => setBatchNumberInput(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Batch
                    </option>
                    {AVAILABLE_BATCHES.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                {user.roll_number && user.batch_number && (
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save &amp; Continue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
