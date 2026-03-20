import { useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { Smartphone, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/dashboard");
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المتجر</h1>
            <p className="text-muted-foreground text-sm">سجّل دخولك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="اسم المستخدم"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                className="pr-10 text-right"
              />
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                className="pr-10 text-right"
              />
            </div>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full h-11 text-base active:scale-[0.97] transition-transform">
              تسجيل الدخول
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            المستخدم: admin | كلمة المرور: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
