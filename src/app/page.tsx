"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Moon, ShieldCheck, Clock, CheckCircle2, ArrowRight, Activity, Award } from "lucide-react";
import { getStudyConfig } from "@/lib/study-config";

export default function HomePage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const config = getStudyConfig();

  useEffect(() => {
    if (!isLoading && user) {
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="py-8 sm:py-16 max-w-4xl mx-auto text-center space-y-10">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-200" />
          Clinical Sleep Research & Circadian Rhythm Lab
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Sleep Study & <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
            Daily Data Collection Portal
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Welcome to the {config.studyName}. Track your daily bedtime, wake-up time, and sleep quality across the {config.targetDays}-day research period to assist our clinical investigation.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
        <Link
          href="/login"
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:shadow-lg"
        >
          <span>Participant Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/register"
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all"
        >
          Register New Account
        </Link>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left pt-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Under 1-Minute Logging</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Record bedtime and wake time with automatic overnight sleep duration calculation.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">14-Day Visual Tracker</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Interactive daily compliance tracker keeping you on pace throughout the research window.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Confidential & Secure</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Row Level Security (RLS) ensures your research records remain strictly private.
          </p>
        </div>
      </div>
    </div>
  );
}
