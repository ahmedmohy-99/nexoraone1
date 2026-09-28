import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, type CartItem } from "@/lib/cart";
import { egp } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — NEXORA" },
      { name: "description", content: "أكمل بياناتك لتأكيد طلبك من NEXORA." },
      { property: "og:title", content: "إتمام الطلب — NEXORA" },
      { property: "og:description", content: "صفحة إتمام الطلب في NEXORA." },
    ],
  }),
  component: Checkout,
});

const METHODS = ["الدفع عند الاستلام", "تحويل فودافون كاش / إنستاباي"];

function Checkout() {
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({ full_name: "", phone: "", governorate: "", city: "", address: "" });
  const [method, setMethod] = useState(METHODS[0]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ number: number; items: CartItem[]; total: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const id = crypto.randomUUID();
    const { error } = await supabase.from("orders").insert({
      id, ...form, payment_method: method, total, user_id: u.user?.id ?? null,
    });
    if (!error) {
      await supabase.from("order_items").insert(
        items.map((i) => ({ order_id: id, product_id: i.id, name: i.name, image_url: i.image_url, unit_price: i.price, quantity: i.quantity })),
      );
    }
    setBusy(false);
    if (error) return toast.error("تعذّر إرسال الطلب");
    const number = 1000 + Math.floor(Math.random() * 9000);
    setDone({ number, items, total });
    clear();
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="glass rounded-3xl p-8 text-center">
          <h1 className="gradient-text text-3xl font-bold">تم تأكيد طلبك</h1>
          <p className="text-muted-foreground mt-3">شكراً لك! سنتواصل معك قريباً لتأكيد التوصيل.</p>
          <div className="mt-6 space-y-1 text-sm">
            {done.items.map((i) => <p key={i.id}>{i.name} × {i.quantity}</p>)}
          </div>
          <p className="text-primary mt-4 text-xl font-bold">{egp(done.total)}</p>
          <Button variant="hero" className="mt-6" asChild><Link to="/store">متابعة التسوق</Link></Button>
        </div>
      </div>
    );
  }

  const f = (k: keyof typeof form, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="glass space-y-4 rounded-3xl p-6">
        <h2 className="text-xl font-bold">بيانات العميل</h2>
        {f("full_name", "الاسم الكامل")}
        {f("phone", "رقم الهاتف")}
        {f("governorate", "المحافظة")}
        {f("city", "المدينة")}
        {f("address", "العنوان")}
        <h2 className="pt-4 text-xl font-bold">طريقة الدفع</h2>
        {METHODS.map((m) => (
          <label key={m} className="glass flex cursor-pointer items-center gap-3 rounded-xl p-3">
            <input type="radio" checked={method === m} onChange={() => setMethod(m)} />
            {m}
          </label>
        ))}
        <p className="text-muted-foreground text-xs">الدفع الإلكتروني بالبطاقة سيتوفر لاحقاً.</p>
        <Button variant="hero" className="w-full" disabled={busy || !items.length}>تأكيد الطلب</Button>
      </form>
      <aside className="glass h-fit rounded-3xl p-6">
        <h2 className="text-lg font-bold">ملخص الطلب</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{egp(i.price * i.quantity)}</span></div>
          ))}
        </div>
        <p className="mt-4 border-t pt-4 font-bold">الإجمالي: <span className="text-primary">{egp(total)}</span></p>
      </aside>
    </div>
  );
}
