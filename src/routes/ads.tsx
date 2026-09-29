import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { useServices } from "@/lib/data";

export const Route = createFileRoute("/ads")({
  head: () => ({
    meta: [
      { title: "تصميم الإعلانات — NEXORA" },
      { name: "description", content: "خدمات تصميم الإعلانات والمونتاج والسوشيال ميديا من NEXORA." },
      { property: "og:title", content: "تصميم الإعلانات — NEXORA" },
      { property: "og:description", content: "اطلب تصميم إعلانك باحترافية من NEXORA." },
    ],
  }),
  component: AdsPage,
});

function AdsPage() {
  const { data, isLoading } = useServices();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="تصميم الإعلانات" subtitle="خدمات تصميم احترافية لعلامتك" />
      {isLoading ? (
        <p className="text-muted-foreground mt-8 text-center">جارٍ التحميل...</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
