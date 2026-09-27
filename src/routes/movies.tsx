import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { MovieCard } from "@/components/site/MovieCard";
import { useMovies } from "@/lib/data";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "أفلام وفيديوهات — NEXORA" },
      {
        name: "description",
        content: "شاهد الأفلام والفيديوهات المملوكة أو المرخّصة للعرض على منصة NEXORA.",
      },
      { property: "og:title", content: "أفلام وفيديوهات — NEXORA" },
      { property: "og:description", content: "تجربة مشاهدة سينمائية لمحتوى NEXORA المرخّص." },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const { data, isLoading } = useMovies();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading
        title="أحدث الأفلام والفيديوهات"
        subtitle="نعرض فقط المحتوى المملوك لنا أو المرخّص لنشره"
      />
      {isLoading ? (
        <p className="text-muted-foreground mt-12 text-center">جارٍ التحميل...</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(data ?? []).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}
