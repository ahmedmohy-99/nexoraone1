import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { waLink, waRequestMessage } from "@/lib/whatsapp";

export const Route = createFileRoute("/request")({
  head: () => ({
    meta: [
      { title: "اطلب تصميم إعلان — NEXORA" },
      { name: "description", content: "أرسل تفاصيل إعلانك لفريق تصميم NEXORA." },
      { property: "og:title", content: "اطلب تصميم إعلان — NEXORA" },
      { property: "og:description", content: "نموذج طلب تصميم إعلان احترافي." },
    ],
  }),
  component: RequestPage,
});

function RequestPage() {
  const [form, setForm] = useState({ name: "", projectName: "", phone: "", adType: "", size: "", details: "", notes: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("service_requests").insert({
      user_id: u.user?.id ?? null,
      name: form.name, project_name: form.projectName, phone: form.phone,
      ad_type: form.adType, size: form.size, details: form.details, notes: form.notes,
    });
    setBusy(false);
    if (error) return toast.error("تعذّر إرسال الطلب");
    setSent(true);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="gradient-text text-center text-3xl font-bold">اطلب تصميم إعلان</h1>
      {sent ? (
        <div className="glass mt-8 rounded-3xl p-8 text-center">
          <p className="text-success text-lg font-bold">تم إرسال طلبك بنجاح، سنتواصل معك قريبًا.</p>
        </div>
      ) : null}
      <form onSubmit={submit} className="glass mt-8 space-y-4 rounded-3xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>الاسم</Label><Input required value={form.name} onChange={set("name")} /></div>
          <div className="space-y-2"><Label>اسم المشروع</Label><Input value={form.projectName} onChange={set("projectName")} /></div>
          <div className="space-y-2"><Label>رقم الهاتف</Label><Input required value={form.phone} onChange={set("phone")} /></div>
          <div className="space-y-2"><Label>نوع الإعلان</Label><Input value={form.adType} onChange={set("adType")} placeholder="سوشيال ميديا، بانر، فيديو..." /></div>
          <div className="space-y-2 sm:col-span-2"><Label>المقاس المطلوب</Label><Input value={form.size} onChange={set("size")} /></div>
        </div>
        <div className="space-y-2"><Label>تفاصيل المشروع</Label><Textarea required value={form.details} onChange={set("details")} /></div>
        <div className="space-y-2">
          <Label>رفع الصور أو الملفات</Label>
          <Input type="file" multiple />
          <p className="text-muted-foreground text-xs">يمكنك أيضاً إرسال الملفات مباشرة عبر واتساب.</p>
        </div>
        <div className="space-y-2"><Label>ملاحظات إضافية</Label><Textarea value={form.notes} onChange={set("notes")} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="hero" disabled={busy}>إرسال الطلب</Button>
          <Button variant="whatsapp" type="button" asChild>
            <a href={waLink(waRequestMessage(form))} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> إرسال الطلب عبر WhatsApp
            </a>
          </Button>
        </div>
      </form>
    </div>
  );
}
