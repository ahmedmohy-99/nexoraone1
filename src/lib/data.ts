import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  price: number;
  discount_price: number | null;
  rating: number;
  stock: number;
  sizes?: string | null;
  colors?: string | null;
};

export type Movie = {
  id: string;
  title: string;
  year: number | null;
  genre: string;
  rating: number;
  description: string;
  poster_url: string | null;
  watch_url: string | null;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  start_price: number;
};

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
};

export const PRODUCT_CATEGORIES = [
  "الكل",
  "ملابس",
  "إلكترونيات",
  "إكسسوارات",
  "أجهزة",
  "ألعاب",
  "منتجات أخرى",
] as const;

export const PORTFOLIO_CATEGORIES = ["الكل", "إعلانات", "تصميمات", "مونتاج", "منتجات"] as const;

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });
}

export function useMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async (): Promise<Movie[]> => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Movie[];
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Service[];
    },
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async (): Promise<PortfolioItem[]> => {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PortfolioItem[];
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    },
  });
}
