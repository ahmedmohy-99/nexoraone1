import { useState } from "react";
import { Play, Star, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Movie } from "@/lib/data";

export function MovieCard({ movie }: { movie: Movie }) {
  const [open, setOpen] = useState(false);

  function watch() {
    if (movie.watch_url) {
      window.open(movie.watch_url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("سيتم إتاحة رابط المشاهدة قريباً");
    }
  }

  return (
    <>
      <article className="glass card-hover group overflow-hidden rounded-3xl">
        <div className="bg-secondary/40 relative aspect-[7/10] overflow-hidden">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : null}
          <div className="from-background absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 translate-y-4 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="hero" size="sm" onClick={watch}>
                <Play />
                مشاهدة الآن
              </Button>
              <Button variant="glass" size="sm" onClick={() => setOpen(true)}>
                <Info />
                التفاصيل
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-bold">{movie.title}</h3>
          <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
            <Star className="text-chart-4 size-4 fill-current" />
            {Number(movie.rating).toFixed(1)}
            <span>•</span>
            <span>{movie.year ?? ""}</span>
            <span>•</span>
            <span>{movie.genre}</span>
          </div>
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{movie.title}</DialogTitle>
            <DialogDescription>
              {movie.year} • {movie.genre} • تقييم {Number(movie.rating).toFixed(1)}
            </DialogDescription>
          </DialogHeader>
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              loading="lazy"
              className="max-h-80 w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="text-sm leading-7">{movie.description}</p>
          <Button variant="hero" onClick={watch}>
            <Play />
            مشاهدة الآن
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
