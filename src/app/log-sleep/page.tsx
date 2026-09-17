"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SleepLog } from "@/types";
import { getParticipantLogs } from "@/lib/supabase/client";
import SleepForm from "@/components/SleepForm";
import { ArrowLeft, Loader2, Moon } from "lucide-react";

export default function LogSleepPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/log-sleep");
      } else if (!user.roll_number || !user.batch_number) {
        router.push("/dashboard");
      } else {
        getParticipantLogs(user.id).then((data) => {
          setLogs(data);
          setIsLoadingLogs(false);
        });
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && isLoadingLogs)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">Loading form...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-4">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Sleep Form */}
      <SleepForm
        participantId={user.id}
        existingLogs={logs}
        onSuccess={() => {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1200);
        }}
        onCancel={() => router.push("/dashboard")}
      />
    </div>
  );
}
