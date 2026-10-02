import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
    </div>
  );
}
