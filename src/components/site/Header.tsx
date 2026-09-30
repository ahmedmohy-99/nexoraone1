import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, MessageCircle, Search, ShoppingCart, User } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { waGeneral, waLink } from "@/lib/whatsapp";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/store", label: "المتجر" },
  { to: "/clothes", label: "الملابس" },
  { to: "/movies", label: "أفلام" },
  { to: "/ads", label: "الإعلانات" },
  { to: "/portfolio", label: "معرض الأعمال" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export function Header() {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/store", search: { q: term } });
    setSearchOpen(false);
  }

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Logo />

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg px-3 py-2 text-sm transition-colors"
              activeProps={{ className: "text-foreground bg-secondary/80" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          <Button variant="ghost" size="icon" aria-label="بحث" onClick={() => setSearchOpen((v) => !v)}>
            <Search />
          </Button>
          <Button variant="ghost" size="icon" aria-label="السلة" asChild>
            <Link to="/cart" className="relative">
              <ShoppingCart />
              {count > 0 ? (
                <span className="gradient-primary-bg text-primary-foreground absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button variant="glass" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to={user ? "/account" : "/auth"}>
              <User />
              {user ? "حسابي" : "تسجيل الدخول"}
            </Link>
          </Button>
          <Button variant="whatsapp" size="icon" aria-label="واتساب" asChild>
            <a href={waLink(waGeneral)} target="_blank" rel="noopener noreferrer">
              <MessageCircle />
            </a>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="القائمة" className="lg:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="hover:bg-secondary/70 rounded-lg px-3 py-3 text-base"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to={user ? "/account" : "/auth"}
                  onClick={() => setMenuOpen(false)}
                  className="hover:bg-secondary/70 rounded-lg px-3 py-3 text-base"
                >
                  {user ? "حسابي" : "تسجيل الدخول"}
                </Link>
                <Button variant="whatsapp" className="mt-4" asChild>
                  <a href={waLink(waGeneral)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle />
                    تواصل معنا عبر WhatsApp
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen ? (
        <form onSubmit={submitSearch} className="border-border/60 border-t px-4 py-3">
          <div className="mx-auto max-w-6xl">
            <Input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="ابحث عن منتج..."
            />
          </div>
        </form>
      ) : null}
    </header>
  );
}
