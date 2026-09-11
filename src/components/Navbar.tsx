"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Moon, ShieldCheck, LogOut, Menu, X, PlusCircle, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isAdmin = user && role === "admin";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <Link href={user ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Moon className="w-5 h-5 fill-indigo-200 text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg flex items-center gap-1.5">
                  Sleep Study
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                    Research
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">14-Day Circadian Rhythm Protocol</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <nav className="flex items-center gap-1">
                  {isAdmin ? (
                    <>
                      <Link
                        href="/admin"
                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          pathname === "/admin"
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/dashboard"
                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          pathname === "/dashboard"
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Participant View
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          pathname === "/dashboard"
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Dashboard
                      </Link>
                      <Link
                        href="/log-sleep"
                        className="ml-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all hover:shadow"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Log Today's Sleep
                      </Link>
                    </>
                  )}
                </nav>

                <div className="h-5 w-px bg-slate-200 dark:border-slate-800" />

                {/* User Profile Pill */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {isAdmin ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Researcher (Admin)</span>
                      ) : (
                        "Study Participant"
                      )}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 text-sm flex items-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg mb-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.email} • {isAdmin ? "Admin Researcher" : "Participant"}</p>
                </div>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Participant View
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      href="/log-sleep"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-950/60"
                    >
                      + Log Today's Sleep
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
