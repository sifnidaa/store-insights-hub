/**
 * Authentication Context
 * 
 * Simplified, robust authentication logic without timeout race conditions.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "seller" | "manager" | "user";

export type UserAccount = {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  currentUser: UserAccount | null;
  role: UserRole | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPasswordForEmail: (email: string, redirectTo: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const isAuthenticated = currentUser !== null;
  const role = currentUser?.role ?? null;

  const fetchProfile = async (userId: string, email: string): Promise<UserAccount> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn("Auth: Error fetching profile, falling back to basic user.", error);
        return { id: userId, email, role: "user", fullName: "" };
      }

      return {
        id: userId,
        email,
        role: (profile?.role as UserRole) || "user",
        fullName: profile?.full_name || "",
      };
    } catch (err) {
      console.error("Auth: Unexpected error in fetchProfile", err);
      return { id: userId, email, role: "user", fullName: "" };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const user = await fetchProfile(session.user.id, session.user.email || "");
          if (mounted) setCurrentUser(user);
        } else if (mounted) {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth init failed", err);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return; // Handled by initialize()

      if (session?.user) {
        const user = await fetchProfile(session.user.id, session.user.email || "");
        if (mounted) setCurrentUser(user);
      } else {
        if (mounted) setCurrentUser(null);
      }
      if (mounted) setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { success: false, error: error.message };
      
      if (data.user) {
        const user = await fetchProfile(data.user.id, data.user.email || "");
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, error: "فشل تسجيل الدخول" };
    } catch (err: any) {
      return { success: false, error: err.message || "حدث خطأ غير متوقع" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const resetPasswordForEmail = async (email: string, redirectTo: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "حدث خطأ غير متوقع" };
    }
  };

  const updateUserPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "حدث خطأ غير متوقع" };
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated, isLoadingAuth, currentUser, role,
      login, logout, resetPasswordForEmail, updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

