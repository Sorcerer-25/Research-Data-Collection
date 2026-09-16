"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, UserPlus } from "lucide-react";

export default function HomePage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

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
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
        <Link
          href="/login"
          className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Participant Sign In</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          href="/register"
          className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-indigo-600/30 dark:border-indigo-500/40 hover:border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold text-base shadow-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-5 h-5" />
          <span>Register New Account</span>
        </Link>
      </div>
    </div>
  );
}
