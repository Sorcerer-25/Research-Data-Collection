"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Participant, UserRole } from "@/types";
import {
  authLogin,
  authLogout,
  authRegister,
  getCurrentUser,
  getSupabaseClient,
  isSupabaseConfigured,
} from "./supabase/client";

interface AuthContextType {
  user: Participant | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfiguredWithSupabase: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: Participant; role?: UserRole; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Error refreshing auth user:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const client = getSupabaseClient();
    if (client) {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await refreshUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { user: loggedInUser, error } = await authLogin(email, password);
    setIsLoading(false);

    if (error || !loggedInUser) {
      return { success: false, error: error || "Login failed" };
    }

    setUser(loggedInUser);
    return { success: true, user: loggedInUser, role: loggedInUser.role };
  };

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    const { user: newUser, error } = await authRegister(fullName, email, password);
    setIsLoading(false);

    if (error || !newUser) {
      return { success: false, error: error || "Registration failed" };
    }

    setUser(newUser);
    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    await authLogout();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isConfiguredWithSupabase: isConfigured,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
