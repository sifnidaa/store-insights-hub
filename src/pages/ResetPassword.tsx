import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Smartphone, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/contexts/StoreContext";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const { updateUserPassword } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session (Supabase sets it automatically from the email hash link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsValidSession(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsValidSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await updateUserPassword(password);
      if (!result.success) {
        setError(result.error || "حدث خطأ أثناء تغيير كلمة المرور");
      } else {
        setIsSuccess(true);
        // Automatically redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Brand Side */}
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
          <h1 className="text-5xl font-bold leading-tight mb-6">تعيين كلمة مرور جديدة</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            الرجاء إدخال كلمة المرور الجديدة لحسابك. تأكد من استخدام كلمة مرور قوية لتأمين حسابك.
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

          {!isValidSession && !isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">رابط الاستعادة غير صالح</h2>
              <p className="text-muted-foreground">
                عذراً، يبدو أن رابط الاستعادة منتهي الصلاحية أو غير صالح. الرجاء طلب رابط جديد.
              </p>
              <Button onClick={() => navigate("/forgot-password")} className="w-full h-12" variant="outline">
                طلب رابط جديد
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">تم تغيير كلمة المرور!</h2>
              <p className="text-muted-foreground">
                لقد تم تغيير كلمة المرور بنجاح. سيتم توجيهك إلى لوحة التحكم الآن...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-right mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-2">كلمة المرور الجديدة</h2>
                <p className="text-muted-foreground">أدخل كلمة مرور قوية لحسابك</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground text-right block">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      className="pl-4 pr-11 h-12 text-left tracking-widest"
                      dir="ltr"
                      disabled={isLoading}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground text-right block">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                      className="pl-4 pr-11 h-12 text-left tracking-widest"
                      dir="ltr"
                      disabled={isLoading}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                  {isLoading ? "جاري الحفظ..." : (
                    <span className="flex items-center gap-2">
                      تأكيد
                      <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
