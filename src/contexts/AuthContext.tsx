import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Auth: Error fetching profile", error);
        return {
          id: userId,
          email: email,
          role: "user" as UserRole,
          fullName: "",
        };
      }

      return {
        id: userId,
        email: email,
        role: (profile?.role as UserRole) || "user",
        fullName: profile?.full_name || "",
      };
    } catch (err) {
      console.error("Auth: Unexpected error fetching profile", err);
      return {
        id: userId,
        email: email,
        role: "user" as UserRole,
        fullName: "",
      };
    }
  }, []);

  // Handle initial session check
  useEffect(() => {
    const initAuth = async () => {
      console.log("Auth: Initializing session check...");
      // Safety timeout to prevent infinite spinner
      const timeoutId = setTimeout(() => {
        if (isLoadingAuth) {
          console.warn("Auth: Session recovery timed out, forcing loading to false");
          setIsLoadingAuth(false);
        }
      }, 5000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Auth: Session found for", session.user.email);
          const userData = await fetchProfile(session.user.id, session.user.email || "");
          setCurrentUser(userData);
        } else {
          console.log("Auth: No active session");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth: Initialization error", err);
      } finally {
        clearTimeout(timeoutId);
        setIsLoadingAuth(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth: State change event:", event);
      if (session?.user) {
        const userData = await fetchProfile(session.user.id, session.user.email || "");
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    if (error) return { success: false, error: error.message };
    
    if (data.user) {
      const userData = await fetchProfile(data.user.id, data.user.email || "");
      setCurrentUser(userData);
      return { success: true };
    }
    return { success: false, error: "فشل تسجيل الدخول" };
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, isLoadingAuth, currentUser, role,
      login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
