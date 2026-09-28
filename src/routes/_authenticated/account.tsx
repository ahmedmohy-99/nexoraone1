import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAuth";
import { egp } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "حسابي — NEXORA" },
      { name: "description", content: "إدارة حسابك وطلباتك في NEXORA." },
      { property: "og:title", content: "حسابي — NEXORA" },
      { property: "og:description", content: "حساب العميل في NEXORA." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const { isAdmin } = useIsAdmin(user);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () =>
      (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const orders = useQuery({
    queryKey: ["my-orders", user.id],
    queryFn: async () =>
      (
        await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const requests = useQuery({
    queryKey: ["my-requests", user.id],
    queryFn: async () =>
      (
        await supabase
          .from("service_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.full_name ?? "");
      setPhone(profile.data.phone ?? "");
    }
  }, [profile.data]);

  async function save() {
    const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", user.id);
    if (error) toast.error("تعذّر الحفظ");
    else toast.success("تم حفظ البيانات");
  }

  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="gradient-text text-3xl font-bold">حسابي</h1>
        <div className="flex gap-2">
          {isAdmin ? (
            <Button variant="hero" asChild>
              <Link to="/admin">لوحة التحكم</Link>
            </Button>
          ) : null}
          <Button variant="glass" onClick={logout}>
            تسجيل الخروج
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="orders">طلباتي</TabsTrigger>
          <TabsTrigger value="requests">الخدمات المطلوبة</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="glass mt-4 space-y-4 rounded-3xl p-6">
            <p className="text-muted-foreground text-sm" dir="ltr">{user.email}</p>
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button variant="hero" onClick={save}>تعديل البيانات</Button>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="mt-4 space-y-3">
            {(orders.data ?? []).length === 0 ? (
              <p className="text-muted-foreground">لا توجد طلبات بعد.</p>
            ) : (
              orders.data!.map((o) => (
                <div key={o.id} className="glass rounded-2xl p-5">
                  <div className="flex justify-between">
                    <span className="font-bold">طلب #{o.order_number}</span>
                    <span className="text-primary">{o.status}</span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {o.order_items.map((i) => `${i.name} × ${i.quantity}`).join("، ")}
                  </p>
                  <p className="mt-2 font-bold">{egp(Number(o.total))}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="mt-4 space-y-3">
            {(requests.data ?? []).length === 0 ? (
              <p className="text-muted-foreground">لا توجد طلبات خدمات بعد.</p>
            ) : (
              requests.data!.map((r) => (
                <div key={r.id} className="glass rounded-2xl p-5">
                  <div className="flex justify-between">
                    <span className="font-bold">{r.ad_type || r.project_name}</span>
                    <span className="text-primary">{r.status}</span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">{r.details}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
