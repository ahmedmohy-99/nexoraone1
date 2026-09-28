import { useEffect, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CrudTable } from "@/components/admin/CrudTable";
import { supabase } from "@/integrations/supabase/client";
import { egp } from "@/lib/format";
import { PRODUCT_CATEGORIES, PORTFOLIO_CATEGORIES } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    if (data !== true) throw redirect({ to: "/account" });
  },
  head: () => ({
    meta: [
      { title: "لوحة التحكم — NEXORA" },
      { name: "description", content: "لوحة تحكم مالك موقع NEXORA." },
      { property: "og:title", content: "لوحة التحكم — NEXORA" },
      { property: "og:description", content: "إدارة محتوى NEXORA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = ["جديد", "قيد التنفيذ", "تم الشحن", "مكتمل", "ملغي"];

function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="gradient-text text-3xl font-bold">لوحة التحكم</h1>
      <Tabs defaultValue="products" className="mt-8">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="movies">الأفلام</TabsTrigger>
          <TabsTrigger value="services">الخدمات</TabsTrigger>
          <TabsTrigger value="portfolio">معرض الأعمال</TabsTrigger>
          <TabsTrigger value="requests">طلبات التصميم</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="messages">الرسائل</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <CrudTable
            table="products"
            publicKey="products"
            titleKey="name"
            fields={[
              { key: "name", label: "اسم المنتج" },
              { key: "description", label: "الوصف", type: "textarea" },
              { key: "category", label: "التصنيف", type: "select", options: PRODUCT_CATEGORIES.slice(1) as unknown as string[] },
              { key: "image_url", label: "صورة المنتج", type: "image" },
              { key: "price", label: "السعر الأصلي", type: "number" },
              { key: "discount_price", label: "السعر بعد الخصم", type: "number" },
              { key: "rating", label: "التقييم (من 5)", type: "number" },
              { key: "stock", label: "المخزون", type: "number" },
            ]}
          />
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          <p className="text-muted-foreground mb-4 text-sm">أضف فقط المحتوى المملوك لك أو المرخّص لنشره.</p>
          <CrudTable
            table="movies"
            publicKey="movies"
            titleKey="title"
            fields={[
              { key: "title", label: "اسم الفيلم" },
              { key: "year", label: "السنة", type: "number" },
              { key: "genre", label: "التصنيف" },
              { key: "rating", label: "التقييم (من 10)", type: "number" },
              { key: "description", label: "الوصف", type: "textarea" },
              { key: "poster_url", label: "البوستر", type: "image" },
              { key: "watch_url", label: "رابط المشاهدة" },
            ]}
          />
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <CrudTable
            table="services"
            publicKey="services"
            titleKey="name"
            fields={[
              { key: "name", label: "اسم الخدمة" },
              { key: "description", label: "الوصف", type: "textarea" },
              { key: "image_url", label: "صورة الخدمة", type: "image" },
              { key: "start_price", label: "السعر يبدأ من", type: "number" },
            ]}
          />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <CrudTable
            table="portfolio"
            publicKey="portfolio"
            titleKey="title"
            fields={[
              { key: "title", label: "اسم المشروع" },
              { key: "category", label: "التصنيف", type: "select", options: PORTFOLIO_CATEGORIES.slice(1) as unknown as string[] },
              { key: "description", label: "الوصف", type: "textarea" },
              { key: "image_url", label: "صورة المشروع", type: "image" },
            ]}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-6"><Orders /></TabsContent>
        <TabsContent value="requests" className="mt-6"><Requests /></TabsContent>
        <TabsContent value="users" className="mt-6"><Users /></TabsContent>
        <TabsContent value="messages" className="mt-6"><Messages /></TabsContent>
        <TabsContent value="settings" className="mt-6"><Settings /></TabsContent>
      </Tabs>
    </div>
  );
}

function Orders() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () =>
      (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data ?? [],
  });
  async function setStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    toast.success("تم تحديث الحالة");
  }
  if (!data?.length) return <p className="text-muted-foreground">لا توجد طلبات.</p>;
  return (
    <div className="space-y-3">
      {data.map((o) => (
        <div key={o.id} className="glass rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">طلب #{o.order_number} — {o.full_name}</span>
            <select
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
              value={o.status}
              onChange={(e) => setStatus(o.id, e.target.value)}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {o.phone} • {o.governorate} - {o.city} - {o.address} • {o.payment_method}
          </p>
          <p className="mt-2 text-sm">{o.order_items.map((i) => `${i.name} × ${i.quantity}`).join("، ")}</p>
          <p className="text-primary mt-2 font-bold">{egp(Number(o.total))}</p>
        </div>
      ))}
    </div>
  );
}

function Requests() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () =>
      (await supabase.from("service_requests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  async function setStatus(id: string, status: string) {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "requests"] });
  }
  if (!data?.length) return <p className="text-muted-foreground">لا توجد طلبات تصميم.</p>;
  return (
    <div className="space-y-3">
      {data.map((r) => (
        <div key={r.id} className="glass rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">{r.name} — {r.project_name}</span>
            <select
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
              value={r.status}
              onChange={(e) => setStatus(r.id, e.target.value)}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">{r.phone} • {r.ad_type} • {r.size}</p>
          <p className="mt-2 text-sm">{r.details}</p>
          {r.notes ? <p className="text-muted-foreground mt-1 text-sm">{r.notes}</p> : null}
        </div>
      ))}
    </div>
  );
}

function Users() {
  const { data } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);
      return (p.data ?? []).map((u) => ({
        ...u,
        roles: (r.data ?? []).filter((x) => x.user_id === u.id).map((x) => x.role),
      }));
    },
  });
  return (
    <div className="space-y-3">
      {(data ?? []).map((u) => (
        <div key={u.id} className="glass flex justify-between rounded-2xl p-4">
          <span>{u.full_name || "بدون اسم"} {u.phone ? `• ${u.phone}` : ""}</span>
          <span className="text-primary text-sm">{u.roles.includes("admin") ? "مالك" : "عميل"}</span>
        </div>
      ))}
    </div>
  );
}

function Messages() {
  const { data } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () =>
      (await supabase.from("messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  if (!data?.length) return <p className="text-muted-foreground">لا توجد رسائل.</p>;
  return (
    <div className="space-y-3">
      {data.map((m) => (
        <div key={m.id} className="glass rounded-2xl p-5">
          <p className="font-bold">{m.name} <span className="text-muted-foreground text-sm">{m.phone} {m.email}</span></p>
          <p className="mt-2 text-sm">{m.body}</p>
        </div>
      ))}
    </div>
  );
}

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () =>
      Object.fromEntries(((await supabase.from("site_settings").select("*")).data ?? []).map((r) => [r.key, r.value])),
  });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  async function save() {
    const rows = Object.entries(form).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) return toast.error("تعذّر الحفظ");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("تم حفظ الإعدادات");
  }
  const labels: Record<string, string> = {
    whatsapp_number: "رقم واتساب (دولي بدون +)",
    hero_title: "عنوان الصفحة الرئيسية",
    hero_subtitle: "النص الفرعي للصفحة الرئيسية",
  };
  return (
    <div className="glass max-w-xl space-y-4 rounded-3xl p-6">
      {Object.keys(labels).map((k) => (
        <div key={k} className="space-y-2">
          <Label>{labels[k]}</Label>
          <Input value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        </div>
      ))}
      <Button variant="hero" onClick={save}>حفظ</Button>
    </div>
  );
}
