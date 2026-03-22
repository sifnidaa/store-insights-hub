import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Smartphone, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/contexts/StoreContext";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const { resetPasswordForEmail } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("الرجاء إدخال البريد الإلكتروني");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const result = await resetPasswordForEmail(email, "https://store-dashboard-dz.netlify.app/reset-password");
      if (!result.success) {
        setError(result.error || "حدث خطأ أثناء إرسال رابط الاستعادة");
      } else {
        setIsSuccess(true);
        toast.success("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-5xl font-bold leading-tight mb-6">هل نسيت كلمة المرور؟</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            لا تقلق، يمكنك استعادة وصولك إلى حسابك بسهولة من خلال إدخال بريدك الإلكتروني وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.
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

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>
          
          <div className="text-center lg:text-right mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">استعادة كلمة المرور</h2>
            <p className="text-muted-foreground">أدخل بريدك الإلكتروني لإرسال رابط الاستعادة</p>
          </div>

          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-green-700 dark:text-green-400 text-lg">تحقق من بريدك الإلكتروني</h3>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  لقد أرسلنا رابط الاستعادة إلى البريد {email}. الرجاء التحقق من صندوق الوارد أو الرسائل غير المرغوب فيها.
                </p>
              </div>
              <Button onClick={() => navigate("/login")} className="w-full h-12 text-base font-bold shadow-lg" variant="outline">
                العودة لتسجيل الدخول
              </Button>
            </div>
          ) : (
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
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                {isLoading ? "جاري الإرسال..." : (
                  <span className="flex items-center gap-2">
                    إرسال الرابط
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
