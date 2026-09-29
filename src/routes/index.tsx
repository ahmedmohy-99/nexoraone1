import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, ArrowLeft, ShoppingBag, Film, Megaphone, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductCard } from "@/components/site/ProductCard";
import { MovieCard } from "@/components/site/MovieCard";
import { ServiceCard } from "@/components/site/ServiceCard";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { useMovies, usePortfolio, useProducts, useServices } from "@/lib/data";
import { waGeneral, waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXORA — كل ما تحتاجه في مكان واحد" },
      {
        name: "description",
        content:
          "متجر إلكتروني، أفلام وفيديوهات، تصميم إعلانات احترافية ومعرض أعمال — كل ذلك على منصة NEXORA.",
      },
      { property: "og:title", content: "NEXORA — كل ما تحتاجه في مكان واحد" },
      {
        property: "og:description",
        content: "منصة رقمية شاملة: متجر، أفلام، تصميم إعلانات ومعرض أعمال.",
      },
    ],
  }),
  component: Home,
});

const categories = [
  {
    num: "01",
    title: "المتجر",
    text: "تصفح منتجاتنا واكتشف أحدث العروض",
    cta: "تسوق الآن",
    to: "/store" as const,
    Icon: ShoppingBag,
  },
  {
    num: "02",
    title: "الأفلام",
    text: "اكتشف الأفلام والفيديوهات المتاحة للمشاهدة",
    cta: "شاهد الآن",
    to: "/movies" as const,
    Icon: Film,
  },
  {
    num: "03",
    title: "الإعلانات",
    text: "تصميم إعلانات احترافية للمنتجات والمشاريع",
    cta: "اطلب تصميمك",
    to: "/ads" as const,
    Icon: Megaphone,
  },
  {
    num: "04",
    title: "معرض الأعمال",
    text: "شاهد نماذج من أعمالنا وتصميماتنا",
    cta: "شاهد الأعمال",
    to: "/portfolio" as const,
    Icon: LayoutGrid,
  },
];

function Home() {
  const products = useProducts();
  const movies = useMovies();
  const services = useServices();
  const portfolio = usePortfolio();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="glass text-muted-foreground inline-block rounded-full px-4 py-1.5 text-xs">
              منصة رقمية شاملة
            </span>
            <h1 className="mt-6 text-4xl leading-tight font-extrabold sm:text-5xl lg:text-6xl">
              <span className="gradient-text">كل ما تحتاجه</span>
              <br />
              في مكان واحد
            </h1>
            <p className="text-muted-foreground mt-5 text-base sm:text-lg">
              متجر إلكتروني • أفلام وفيديوهات • تصميم إعلانات • معرض أعمال
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/ads">
                  استكشف الآن
                  <ArrowLeft />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/store">تصفح المتجر</Link>
              </Button>
              <Button variant="whatsapp" size="lg" asChild>
                <a href={waLink(waGeneral)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle />
                  تواصل معنا عبر WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="glass overflow-hidden rounded-[2rem] p-2">
            <img
              src="/images/hero.jpg"
              alt="NEXORA — متجر وأفلام وتصميم إعلانات"
              width={1600}
              height={912}
              className="w-full rounded-[1.6rem] object-cover"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading title="أقسام NEXORA" subtitle="اختر ما تحتاجه وابدأ فوراً" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <article key={c.num} className="glass card-hover rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <span className="gradient-text text-3xl font-extrabold">{c.num}</span>
                <span className="gradient-primary-bg text-primary-foreground flex size-11 items-center justify-center rounded-2xl">
                  <c.Icon className="size-5" />
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold">{c.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-7">{c.text}</p>
              <Button variant="glass" className="mt-5 w-full" asChild>
                <Link to={c.to}>{c.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* STORE */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading title="أحدث المنتجات" subtitle="منتجات مختارة لك" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(products.data ?? []).slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="glass" size="lg" asChild>
            <Link to="/store">تصفح كل المنتجات</Link>
          </Button>
        </div>
      </section>

      {/* مساحة إعلانية */}
      <div className="mx-auto max-w-6xl px-4">
        <AdSlot className="glass-card overflow-hidden rounded-xl p-2" />
      </div>



      {/* MOVIES */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          title="أحدث الأفلام والفيديوهات"
          subtitle="محتوى مملوك لنا أو مرخّص للعرض"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(movies.data ?? []).slice(0, 4).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </section>

      {/* ADS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading title="تصميم الإعلانات" subtitle="حوّل فكرتك إلى إعلان احترافي" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(services.data ?? []).slice(0, 4).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/request">اطلب تصميم إعلان</Link>
          </Button>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading title="معرض الأعمال" subtitle="نماذج من تصميماتنا وأعمالنا" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(portfolio.data ?? []).slice(0, 4).map((i) => (
            <PortfolioCard key={i.id} item={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
