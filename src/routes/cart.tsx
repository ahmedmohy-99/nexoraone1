import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { egp } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة المشتريات — NEXORA" },
      { name: "description", content: "راجع منتجاتك في سلة مشتريات NEXORA." },
      { property: "og:title", content: "سلة المشتريات — NEXORA" },
      { property: "og:description", content: "سلة مشترياتك في NEXORA." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, setQuantity, remove, clear } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="gradient-text text-3xl font-bold">سلة المشتريات</h1>
      {items.length === 0 ? (
        <div className="glass mt-8 rounded-3xl p-10 text-center">
          <p className="text-muted-foreground">السلة فارغة.</p>
          <Button variant="hero" className="mt-4" asChild><Link to="/store">تصفح المتجر</Link></Button>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {items.map((i) => (
              <div key={i.id} className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
                {i.image_url ? <img src={i.image_url} alt={i.name} className="size-16 rounded-xl object-cover" /> : null}
                <div className="flex-1">
                  <p className="font-bold">{i.name}</p>
                  <p className="text-muted-foreground text-sm">سعر الوحدة: {egp(i.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="glass" onClick={() => setQuantity(i.id, i.quantity + 1)}><Plus /></Button>
                  <span className="w-6 text-center">{i.quantity}</span>
                  <Button size="icon" variant="glass" onClick={() => setQuantity(i.id, i.quantity - 1)}><Minus /></Button>
                </div>
                <span className="text-primary w-24 font-bold">{egp(i.price * i.quantity)}</span>
                <Button size="sm" variant="ghost" onClick={() => remove(i.id)}><Trash2 /> حذف</Button>
              </div>
            ))}
          </div>
          <div className="glass mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
            <span className="text-xl font-bold">الإجمالي: <span className="text-primary">{egp(total)}</span></span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={clear}>تفريغ السلة</Button>
              <Button variant="hero" asChild><Link to="/checkout">متابعة الدفع</Link></Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
