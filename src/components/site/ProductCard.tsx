import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Star, ShoppingCart, Zap, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/data";
import { egp, effectivePrice } from "@/lib/format";
import { useCart } from "@/lib/cart";

function splitList(value?: string | null) {
  return (value ?? "")
    .split(/[,،]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const price = effectivePrice(Number(product.price), Number(product.discount_price));
  const hasDiscount = price < Number(product.price);
  const soldOut = product.stock <= 0;

  const sizes = splitList(product.sizes);
  const colors = splitList(product.colors);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);

  function addToCart() {
    if (sizes.length && !size) {
      toast.error("اختر المقاس أولاً");
      return false;
    }
    if (colors.length && !color) {
      toast.error("اختر اللون أولاً");
      return false;
    }
    const extra = [size, color].filter(Boolean).join(" - ");
    add({
      id: [product.id, size, color].filter(Boolean).join("|"),
      name: extra ? `${product.name} (${extra})` : product.name,
      image_url: product.image_url,
      price,
    });
    toast.success("تمت إضافة المنتج إلى السلة");
    return true;
  }

  const options = (
    <div className="mt-4 space-y-3">
      {sizes.length ? (
        <div>
          <p className="mb-2 text-xs font-bold">المقاس</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={size === s ? "hero" : "glass"}
                onClick={() => setSize(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      {colors.length ? (
        <div>
          <p className="mb-2 text-xs font-bold">اللون</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={color === c ? "hero" : "glass"}
                onClick={() => setColor(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <article className="glass card-hover flex flex-col overflow-hidden rounded-3xl">
        <div className="bg-secondary/40 relative aspect-square overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : null}
          {hasDiscount ? (
            <span className="gradient-primary-bg text-primary-foreground absolute top-3 start-3 rounded-full px-3 py-1 text-xs font-bold">
              خصم {Math.round((1 - price / Number(product.price)) * 100)}%
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
            <Star className="text-chart-4 size-4 fill-current" />
            <span>{Number(product.rating).toFixed(1)}</span>
            <span className="mx-2">•</span>
            <span>{product.category}</span>
          </div>
          <h3 className="text-lg font-bold">{product.name}</h3>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{product.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-primary text-xl font-extrabold">{egp(price)}</span>
            {hasDiscount ? (
              <span className="text-muted-foreground text-sm line-through">
                {egp(Number(product.price))}
              </span>
            ) : null}
          </div>
          <p className={`mt-1 text-xs ${soldOut ? "text-destructive" : "text-success"}`}>
            {soldOut ? "غير متوفر حالياً" : `متوفر (${product.stock} قطعة)`}
          </p>
          <div className="mt-5 grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="hero" disabled={soldOut} onClick={addToCart}>
                <ShoppingCart />
                أضف إلى السلة
              </Button>
              <Button
                variant="glass"
                disabled={soldOut}
                onClick={() => {
                  addToCart();
                  navigate({ to: "/checkout" });
                }}
              >
                <Zap />
                اشترِ الآن
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setOpen(true)}>
              <Eye />
              عرض المنتج
            </Button>
          </div>
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>{product.category}</DialogDescription>
          </DialogHeader>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="max-h-72 w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="text-sm leading-7">{product.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-primary text-xl font-extrabold">{egp(price)}</span>
            {hasDiscount ? (
              <span className="text-muted-foreground text-sm line-through">
                {egp(Number(product.price))}
              </span>
            ) : null}
          </div>
          <Button variant="hero" disabled={soldOut} onClick={addToCart}>
            <ShoppingCart />
            أضف إلى السلة
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
