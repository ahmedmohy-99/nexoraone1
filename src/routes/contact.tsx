import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { waGeneral, waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — NEXORA" },
      { name: "description", content: "تواصل مع فريق NEXORA عبر واتساب أو نموذج الرسائل." },
      { property: "og:title", content: "تواصل معنا — NEXORA" },
      { property: "og:description", content: "نحن هنا للرد على استفساراتك." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", body: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("messages").insert(form);
    setBusy(false);
    if (error) return toast.error("تعذّر إرسال الرسالة");
    toast.success("تم إرسال رسالتك، سنرد عليك قريباً");
    setForm({ name: "", email: "", phone: "", body: "" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="gradient-text text-center text-3xl font-bold">تواصل معنا</h1>
      <div className="mt-8 text-center">
        <Button variant="whatsapp" size="lg" asChild>
          <a href={waLink(waGeneral)} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> تواصل معنا عبر WhatsApp
          </a>
        </Button>
      </div>
      <form onSubmit={submit} className="glass mt-8 space-y-4 rounded-3xl p-6">
        <div className="space-y-2"><Label>الاسم</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>البريد الإلكتروني</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-2"><Label>رقم الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-2"><Label>رسالتك</Label><Textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
        <Button variant="hero" className="w-full" disabled={busy}>إرسال</Button>
      </form>
    </div>
  );
}
