import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — NEXORA" },
      { name: "description", content: "سجّل الدخول أو أنشئ حساباً جديداً في NEXORA." },
      { property: "og:title", content: "تسجيل الدخول — NEXORA" },
      { property: "og:description", content: "الدخول إلى حسابك في NEXORA." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
        navigate({ to: "/account" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/account" });
        else toast.success("تم إنشاء الحساب، افتح بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.");
        setMode("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(
        msg.includes("Invalid login")
          ? "البريد أو كلمة المرور غير صحيحة"
          : msg.includes("not confirmed")
            ? "يرجى تأكيد بريدك الإلكتروني أولاً"
            : msg || "حدث خطأ",
      );
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (res.error) toast.error("تعذّر الدخول بحساب Google");
    else if (!res.redirected) navigate({ to: "/account" });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass rounded-3xl p-8">
        <h1 className="gradient-text text-center text-3xl font-bold">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input type="password" dir="ltr" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button variant="hero" className="w-full" disabled={busy}>
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </Button>
        </form>
        <Button variant="glass" className="mt-3 w-full" onClick={google}>
          المتابعة بحساب Google
        </Button>
        <button
          className="text-muted-foreground hover:text-primary mt-6 w-full text-sm"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "ليس لديك حساب؟ إنشاء حساب" : "لديك حساب؟ تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}
