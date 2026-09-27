import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { useServices } from "@/lib/data";
import { waGeneral, waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/ads")({
  head: () => ({
    meta: [
      { title: "تصميم الإعلانات — NEXORA" },
      {
        name: "description",
        content:
          "خدمات تصميم إعلانات السوشيال ميديا، البوستات والبانرات، إعلانات المنتجات ومونتاج فيديو.",
      },
      { property: "og:title", content: "تصميم الإعلانات — NEXORA" },
      { property: "og:description", content: "حوّل فكرتك إلى إعلان احترافي مع فريق NEXORA." },
    ],
  }),
  component: AdsPage,
});

function AdsPage() {
  const { data, isLoading } = useServices();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="تصميم الإعلانات" subtitle="حوّل فكرتك إلى إعلان احترافي" />

      {isLoading ? (
        <p className="text-muted-foreground mt-12 text-center">جارٍ التحميل...</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(data ?? []).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}

      <div className="glass mt-14 rounded-3xl p-8 text-center">
        <h3 className="text-2xl font-bold">جاهز لبدء مشروعك؟</h3>
        <p className="text-muted-foreground mt-3">
          أرسل تفاصيل إعلانك وسنعود إليك بأسرع وقت، أو تواصل معنا مباشرة على واتساب.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="hero" size="lg" asChild>
            <Link to="/request">اطلب تصميم إعلان</Link>
          </Button>
          <Button variant="whatsapp" size="lg" asChild>
            <a href={waLink(waGeneral)} target="_blank" rel="noopener noreferrer">
              <MessageCircle />
              تواصل معنا عبر WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
