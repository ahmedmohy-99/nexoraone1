import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCT_CATEGORIES, useProducts } from "@/lib/data";
import { getSpeedegyItems } from "@/lib/speedegy.functions";
import { getAmazonBestSellers } from "@/lib/amazon.functions";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/store")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => (typeof search["q"] === "string" ? { q: search["q"] } : {}),
  head: () => ({
    meta: [
      { title: "المتجر — NEXORA" },
      {
        name: "description",
        content: "تصفح منتجات NEXORA: إلكترونيات، أجهزة، إكسسوارات وألعاب بأحدث العروض.",
      },
      { property: "og:title", content: "المتجر — NEXORA" },
      { property: "og:description", content: "منتجات مختارة بأسعار وعروض خاصة من NEXORA." },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useProducts();
  const [term, setTerm] = useState(q ?? "");
  const [category, setCategory] = useState<string>("الكل");

  const products = (data ?? []).filter((p) => {
    const matchCat = category === "الكل" || p.category === category;
    const matchTerm =
      !term.trim() ||
      p.name.includes(term.trim()) ||
      p.description.includes(term.trim());
    return matchCat && matchTerm;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="أحدث المنتجات" subtitle="منتجات مختارة لك" />

      <div className="mt-10 space-y-5">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="mx-auto max-w-xl"
        />
        <div className="flex flex-wrap justify-center gap-2">
          {PRODUCT_CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "hero" : "glass"}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground mt-12 text-center">جارٍ تحميل المنتجات...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-center">لا توجد منتجات مطابقة.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      <ClothesSection />
      <AmazonSection />
    </div>
  );
}

function parsePrice(price: string): number {
  const n = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function ClothesSection() {
  const fetchItems = useServerFn(getSpeedegyItems);
  const { add } = useCart();
  const { data } = useQuery({
    queryKey: ["speedegy", 1],
    queryFn: () => fetchItems({ data: { page: 1 } }),
    staleTime: 5 * 60 * 1000,
  });
  const items = data?.items.slice(0, 8) ?? [];
  if (!items.length) return null;
  return (
    <div className="glass mt-20 rounded-3xl p-4 sm:p-6">
      <SectionHeading title="الملابس" subtitle="أحدث التصميمات — تتحدث تلقائيًا" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.id} className="glass card-hover overflow-hidden rounded-3xl">
            <div className="bg-secondary/40 aspect-square overflow-hidden">
              <img src={it.image} alt={it.title} loading="lazy" className="size-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="line-clamp-1 font-bold">{it.title}</h3>
              <p className="text-primary mt-2 font-extrabold">{it.price}</p>
              <Button
                className="mt-3 w-full"
                size="sm"
                onClick={() => {
                  add({ id: `speedegy-${it.id}`, name: it.title, image_url: it.image, price: parsePrice(it.price) });
                  toast.success("تمت الإضافة إلى السلة");
                }}
              >
                أضف إلى السلة
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmazonSection() {
  const fetchItems = useServerFn(getAmazonBestSellers);
  const { data } = useQuery({
    queryKey: ["amazon", "fashion"],
    queryFn: () => fetchItems({ data: { category: "fashion" } }),
    staleTime: 10 * 60 * 1000,
  });
  const items = data?.items.slice(0, 8) ?? [];
  if (!items.length) return null;
  return (
    <div className="glass mt-8 rounded-3xl p-4 sm:p-6">
      <SectionHeading title="عروض" subtitle="الأكثر مبيعًا — يتحدث تلقائيًا" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((it) => (
          <a
            key={it.asin}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass card-hover block overflow-hidden rounded-3xl"
          >
            <div className="bg-secondary/40 aspect-square overflow-hidden">
              <img src={it.image} alt={it.title} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-bold">{it.title}</h3>
              <p className="text-primary mt-2 font-extrabold">{it.price}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
