/**
 * Authentication Context
 * 
 * This module manages the global authentication state of the application.
 * It handles session initialization, user profile fetching (roles), 
 * login/logout operations, and session persistence using Supabase.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Define the available roles in the system
export type UserRole = "admin" | "seller" | "manager" | "user";

// Define the structure of the user account data
export type UserAccount = {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
};

// Define the shape of the authentication context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  currentUser: UserAccount | null;
  role: UserRole | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access the authentication context
 * Must be used within an AuthProvider
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication state to all children
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Derived state for convenience
  const isAuthenticated = currentUser !== null;
  const role = currentUser?.role ?? null;

  /**
   * Fetches the user's profile from the 'profiles' table in Supabase
   * This is necessary to determine the user's role and display name.
   */
  const fetchProfile = useCallback(async (userId: string, email: string) => {
    try {
      // Step 1: Query the profiles table for the specific user ID
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Step 2: Handle database errors (e.g., profile doesn't exist yet)
      if (error) {
        console.error("Auth: Error fetching profile", error);
        // Fallback to minimal data if profile fetch fails
        return {
          id: userId,
          email: email,
          role: "user" as UserRole,
          fullName: "",
        };
      }

      // Step 3: Return the combined user and profile data
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

  /**
   * Initialize Authentication
   * Runs once on mount to check if a session already exists (persistence)
   */
  useEffect(() => {
    const initAuth = async () => {
      console.log("Auth: Initializing session check...");
      
      // Safety timeout: Ensure the loading spinner doesn't run forever if Supabase hanging
      const timeoutId = setTimeout(() => {
        if (isLoadingAuth) {
          console.warn("Auth: Session recovery timed out, forcing loading to false");
          setIsLoadingAuth(false);
        }
      }, 5000);

      try {
        // Step 1: Check for an existing session in local storage
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Auth: Session found for", session.user.email);
          // Step 2: If session exists, fetch the full profile
          const userData = await fetchProfile(session.user.id, session.user.email || "");
          setCurrentUser(userData);
        } else {
          console.log("Auth: No active session");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth: Initialization error", err);
      } finally {
        // Step 3: Cleanup timeout and stop loading state
        clearTimeout(timeoutId);
        setIsLoadingAuth(false);
      }
    };

    initAuth();

    /**
     * Listen for Authentication State Changes
     * Automatically updates the local state when the user logs in, logs out,
     * or when the token is refreshed.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth: State change event:", event);
      
      if (session?.user) {
        // Handle login or token refresh
        const userData = await fetchProfile(session.user.id, session.user.email || "");
        setCurrentUser(userData);
      } else {
        // Handle logout
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * Login Handler
   * Authenticates the user with Supabase using email and password
   */
  const login = useCallback(async (email: string, pass: string) => {
    // Step 1: Call Supabase Auth API
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    // Step 2: Handle authentication errors
    if (error) return { success: false, error: error.message };
    
    // Step 3: Fetch profile and update local state upon success
    if (data.user) {
      const userData = await fetchProfile(data.user.id, data.user.email || "");
      setCurrentUser(userData);
      return { success: true };
    }
    
    return { success: false, error: "فشل تسجيل الدخول" };
  }, [fetchProfile]);

  /**
   * Logout Handler
   * Signs the user out from Supabase and clears local state
   */
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

