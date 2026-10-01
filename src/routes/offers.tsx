import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AMAZON_CATEGORIES, getAmazonBestSellers } from "@/lib/amazon.functions";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "عروض أمازون — NEXORA" },
      { name: "description", content: "الأكثر مبيعًا على أمازون مصر — تتحدث باستمرار." },
      { property: "og:title", content: "عروض أمازون — NEXORA" },
      { property: "og:description", content: "الأكثر مبيعًا على أمازون مصر — تتحدث باستمرار." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const [category, setCategory] = useState<string>("fashion");
  const fetchItems = useServerFn(getAmazonBestSellers);
  const { data, isLoading } = useQuery({
    queryKey: ["amazon", category],
    queryFn: () => fetchItems({ data: { category } }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="عروض أمازون" subtitle="الأكثر مبيعًا — يتحدث تلقائيًا" />
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {AMAZON_CATEGORIES.map((c) => (
          <Button
            key={c.slug}
            size="sm"
            variant={category === c.slug ? "default" : "glass"}
            onClick={() => setCategory(c.slug)}
          >
            {c.label}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-muted-foreground mt-12 text-center">جارٍ التحميل...</p>
      ) : !data?.items.length ? (
        <p className="text-muted-foreground mt-12 text-center">لا توجد منتجات حالياً.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {data.items.map((it) => (
            <a
              key={it.asin}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass card-hover group overflow-hidden rounded-3xl"
            >
              <div className="bg-secondary/40 flex aspect-square items-center justify-center overflow-hidden p-4">
                <img
                  src={it.image}
                  alt={it.title}
                  loading="lazy"
                  className="max-h-full object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold">{it.title}</h3>
                {it.price && <p className="text-primary mt-2 font-extrabold">{it.price}</p>}
                <span className="text-muted-foreground mt-2 inline-flex items-center gap-1 text-xs">
                  عرض على أمازون <ExternalLink className="size-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
