import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { PORTFOLIO_CATEGORIES, usePortfolio } from "@/lib/data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "معرض الأعمال — NEXORA" },
      {
        name: "description",
        content: "نماذج من أعمال NEXORA: إعلانات، تصميمات، مونتاج وتصوير منتجات.",
      },
      { property: "og:title", content: "معرض الأعمال — NEXORA" },
      { property: "og:description", content: "شاهد نماذج من تصميماتنا وأعمالنا السابقة." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data, isLoading } = usePortfolio();
  const [category, setCategory] = useState<string>("الكل");
  const items = (data ?? []).filter((i) => category === "الكل" || i.category === category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="معرض الأعمال" subtitle="نماذج من تصميماتنا وأعمالنا" />

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {PORTFOLIO_CATEGORIES.map((c) => (
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

      {isLoading ? (
        <p className="text-muted-foreground mt-12 text-center">جارٍ التحميل...</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <PortfolioCard key={i.id} item={i} />
          ))}
        </div>
      )}
    </div>
  );
}
