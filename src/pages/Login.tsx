/**
 * Login Page Component
 * 
 * Provides the user interface for authentication.
 * Handles form submission, error display, and automatic redirection
 * if the user is already authenticated.
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Smartphone, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  // --- Form State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Auth & Navigation Hooks ---
  const { login, isAuthenticated, role, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Automatic Redirection
   * If the user is already logged in, redirect them to their appropriate dashboard.
   */
  useEffect(() => {
    if (isAuthenticated && role) {
      // Sellers go to POS, Admins/Managers go to Dashboard
      navigate(role === "seller" ? "/pos" : "/dashboard");
    }
  }, [isAuthenticated, role, navigate]);

  /**
   * Form Submission Handler
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Step 1: Attempt to login using the AuthContext
      const result = await login(email, password);
      
      if (result.success) {
        // Step 2: On success, the AuthContext state updates.
        // The useEffect above will trigger and redirect the user.
        console.log("Login: Success, waiting for redirection...");
      } else {
        // Step 3: Handle authentication errors (wrong credentials, etc.)
        setError(result.error || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  // Show a loading spinner during initial session check
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المتجر</h1>
            <p className="text-muted-foreground text-sm">سجّل دخولك للوصول إلى لوحة التحكم</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="pr-10 text-right"
                disabled={isLoading}
              />
            </div>
            
            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة المرور"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                disabled={isLoading}
                className="pr-10 pl-10 text-right"
              />
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-pulse text-destructive text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full h-11 text-base active:scale-[0.97] transition-transform" disabled={isLoading}>
              {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <p className="text-xs text-center text-muted-foreground">
            المسؤول: admin@test.com | البائع: seller@test.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

