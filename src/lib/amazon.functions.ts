import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AmazonItem = {
  asin: string;
  title: string;
  price: string;
  image: string;
  url: string;
};

export const AMAZON_CATEGORIES = [
  { slug: "fashion", label: "الأزياء" },
  { slug: "electronics", label: "إلكترونيات" },
  { slug: "beauty", label: "الجمال" },
  { slug: "home", label: "المنزل والمطبخ" },
  { slug: "sporting-goods", label: "الرياضة" },
  { slug: "toys", label: "ألعاب" },
] as const;

function decode(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const getAmazonBestSellers = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ category: z.string().default("fashion") }).parse(d))
  .handler(async ({ data }): Promise<{ items: AmazonItem[] }> => {
    const cat = AMAZON_CATEGORIES.some((c) => c.slug === data.category) ? data.category : "fashion";
    try {
      const res = await fetch(`https://www.amazon.eg/gp/bestsellers/${cat}`, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          "accept-language": "ar-EG,ar;q=0.9,en;q=0.8",
        },
      });
      if (!res.ok) return { items: [] };
      const html = await res.text();
      const blocks = html.split("zg-grid-general-faceout").slice(1);
      const items: AmazonItem[] = [];
      const seen = new Set<string>();
      for (const raw of blocks) {
        const b = raw.slice(0, 9000);
        const asin = b.match(/\/dp\/([A-Z0-9]{10})/)?.[1];
        if (!asin || seen.has(asin)) continue;
        seen.add(asin);
        const img = b.match(/<img[^>]*src="(https:\/\/[^"]+media-amazon[^"]+)"/);
        const title =
          b.match(/line-clamp[^"]*"[^>]*>([^<]{4,300})<\/div>/)?.[1] ??
          b.match(/<img[^>]*alt="([^"]+)"/)?.[1] ??
          "";
        const price = b.match(/_cDEzb_p13n-sc-price_[^"]+"[^>]*>([^<]+)</)?.[1] ?? "";
        items.push({
          asin,
          title: decode(title),
          price: decode(price),
          image: img?.[1] ?? "",
          url: `https://www.amazon.eg/dp/${asin}`,
        });
      }
      return { items };
    } catch {
      return { items: [] };
    }
  });
