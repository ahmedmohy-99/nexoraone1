import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getSpeedegyItems } from "@/lib/speedegy.functions";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/clothes")({
  head: () => ({
    meta: [
      { title: "الملابس — NEXORA" },
      { name: "description", content: "تشكيلة تيشيرتات وملابس بتصميمات مميزة تتحدث باستمرار." },
      { property: "og:title", content: "الملابس — NEXORA" },
      { property: "og:description", content: "تيشيرتات وملابس بتصميمات مميزة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClothesPage,
});

function parsePrice(price: string): number {
  const n = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function ClothesPage() {
  const [page, setPage] = useState(1);
  const fetchItems = useServerFn(getSpeedegyItems);
  const { add } = useCart();
  const { data, isLoading } = useQuery({
    queryKey: ["speedegy", page],
    queryFn: () => fetchItems({ data: { page } }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="الملابس" subtitle="أحدث التصميمات" />
      {isLoading ? (
        <p className="text-muted-foreground mt-12 text-center">جارٍ التحميل...</p>
      ) : !data?.items.length ? (
        <p className="text-muted-foreground mt-12 text-center">لا توجد منتجات حالياً.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {data.items.map((it) => (
            <div key={it.id} className="glass card-hover overflow-hidden rounded-3xl">
              <div className="bg-secondary/40 aspect-square overflow-hidden">
                <img src={it.image} alt={it.title} loading="lazy" className="size-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-bold">{it.title}</h3>
                <p className="text-muted-foreground text-xs">{it.type}</p>
                <p className="text-primary mt-2 font-extrabold">{it.price}</p>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  onClick={() => {
                    add({
                      id: `speedegy-${it.id}`,
                      name: it.title,
                      image_url: it.image,
                      price: parsePrice(it.price),
                    });
                    toast.success("تمت الإضافة إلى السلة");
                  }}
                >
                  أضف إلى السلة
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-10 flex items-center justify-center gap-3">
        <Button variant="glass" disabled={page <= 1} onClick={() => setPage(page - 1)}>السابق</Button>
        <span className="text-sm">{page} / {data?.lastPage ?? "…"}</span>
        <Button variant="glass" disabled={!!data && page >= data.lastPage} onClick={() => setPage(page + 1)}>التالي</Button>
      </div>
      <p className="text-muted-foreground mt-8 text-center text-sm">
        أضف القطع للسلة وأكمل طلبك من هنا — {" "}
        <Link to="/cart" className="text-primary underline">الذهاب إلى السلة</Link>
      </p>
    </div>
  );
}
