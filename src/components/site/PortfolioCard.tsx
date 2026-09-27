import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PortfolioItem } from "@/lib/data";

export function PortfolioCard({ item }: { item: PortfolioItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="glass card-hover group overflow-hidden rounded-3xl">
        <div className="bg-secondary/40 aspect-[10/7] overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : null}
        </div>
        <div className="p-5">
          <span className="bg-secondary/80 text-muted-foreground rounded-full px-3 py-1 text-xs">
            {item.category}
          </span>
          <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{item.description}</p>
          <Button variant="glass" className="mt-4 w-full" onClick={() => setOpen(true)}>
            <Eye />
            عرض العمل
          </Button>
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
            <DialogDescription>{item.category}</DialogDescription>
          </DialogHeader>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              className="max-h-80 w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="text-sm leading-7">{item.description}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
