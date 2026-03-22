import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Smartphone, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/contexts/StoreContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, role, isLoadingAuth } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && role) {
      const from = (location.state as any)?.from?.pathname;
      const defaultDashboard = role === "seller" ? "/pos" : "/dashboard";
      navigate(from || defaultDashboard, { replace: true });
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Brand Side - Hidden on mobile */}
      <div className="hidden lg:flex flex-col flex-1 bg-primary text-primary-foreground p-12 justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-foreground/20 opacity-90 z-0"></div>
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white text-primary rounded-xl flex items-center justify-center shadow-lg">
            {settings.logoUrl ? (
               <img src={settings.logoUrl} alt="logo" className="w-8 h-8 object-contain" />
            ) : (
               <Smartphone className="w-6 h-6" />
            )}
          </div>
          <span className="font-bold text-2xl">{settings.storeName || "منصة إدارة المتجر"}</span>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold leading-tight mb-6">مرحباً بك مجدداً</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم الخاصة بك، وإدارة المبيعات، والاطلاع على أحدث الإحصائيات لمشروعك.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative animate-fade-in">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="logo" className="w-10 h-10 object-contain" />
              ) : (
                <Smartphone className="w-8 h-8" />
              )}
            </div>
          </div>
          
          <div className="text-center lg:text-right mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">تسجيل الدخول</h2>
            <p className="text-muted-foreground">أدخل بياناتك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground text-right block">البريد الإلكتروني</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  className="pl-4 pr-11 h-12 text-left"
                  dir="ltr"
                  disabled={isLoading}
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  نسيت كلمة المرور؟
                </Link>
                <label className="text-sm font-medium text-foreground block">كلمة المرور</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  className="pl-[3rem] pr-11 h-12 text-left tracking-widest"
                  dir="ltr"
                  disabled={isLoading}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-full px-2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                <span className="text-destructive font-bold text-sm text-center">{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-6 group" 
              disabled={isLoading}
            >
              {isLoading ? "جاري التحميل..." : (
                <span className="flex items-center gap-2">
                  دخول
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
