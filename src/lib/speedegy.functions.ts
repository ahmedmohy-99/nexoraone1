import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ExternalItem = {
  id: string;
  title: string;
  type: string;
  price: string;
  image: string;
  url: string;
};

const BASE = "https://speedegy.net";

function clean(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export const getSpeedegyItems = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ page: z.number().int().min(1).max(200) }).parse(d))
  .handler(async ({ data }): Promise<{ items: ExternalItem[]; lastPage: number }> => {
    const res = await fetch(`${BASE}/publicStore?page=${data.page}`, {
      headers: { "user-agent": "Mozilla/5.0" },
    });
    if (!res.ok) return { items: [], lastPage: 1 };
    const html = await res.text();
    const parts = html.split('class="design-card-link"').slice(1);
    const items: ExternalItem[] = [];
    for (const p of parts) {
      const url = p.match(/href="([^"]+\/designs\/(\d+))"/);
      if (!url) continue;
      const img = p.match(/<img[^>]*src="([^"]+)"/);
      const title = p.match(/class="card-title"[^>]*>([\s\S]*?)<\/h5>/);
      const type = p.match(/class="product-type-badge"[^>]*>([\s\S]*?)<\/span>/);
      const price = p.match(/([\d,.]+)\s*ج\.م/);
      const src = img?.[1] ?? "";
      items.push({
        id: url[2] ?? "",
        url: url[1] ?? "",
        title: title ? clean(title[1] ?? "") : "",
        type: type ? clean(type[1] ?? "").replace(/^[^\p{L}]+/u, "") : "",
        price: price ? `${price[1]} ج.م` : "",
        image: src.startsWith("http") ? src : `${BASE}${src}`,
      });
    }
    const pages = [...html.matchAll(/publicStore\?page=(\d+)/g)].map((m) => Number(m[1]));
    return { items, lastPage: Math.max(data.page, ...pages) };
  });
