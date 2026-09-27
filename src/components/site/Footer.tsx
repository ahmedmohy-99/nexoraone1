import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { waGeneral, waLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-border/60 mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="text-muted-foreground mt-4 text-sm leading-7">
            منصة رقمية شاملة تجمع المتجر الإلكتروني، الأفلام والفيديوهات، تصميم الإعلانات ومعرض
            الأعمال في مكان واحد.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold">روابط سريعة</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-primary">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/store" className="hover:text-primary">
                المتجر
              </Link>
            </li>
            <li>
              <Link to="/movies" className="hover:text-primary">
                أفلام
              </Link>
            </li>
            <li>
              <Link to="/ads" className="hover:text-primary">
                الإعلانات
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold">خدماتنا</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link to="/portfolio" className="hover:text-primary">
                معرض الأعمال
              </Link>
            </li>
            <li>
              <Link to="/request" className="hover:text-primary">
                اطلب تصميم إعلان
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                تواصل معنا
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-primary">
                سلة المشتريات
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold">تواصل مباشر</h3>
          <p className="text-muted-foreground mb-4 text-sm" dir="ltr">
            +{WHATSAPP_NUMBER}
          </p>
          <Button variant="whatsapp" asChild>
            <a href={waLink(waGeneral)} target="_blank" rel="noopener noreferrer">
              <MessageCircle />
              تواصل معنا عبر WhatsApp
            </a>
          </Button>
        </div>
      </div>
      <div className="border-border/60 text-muted-foreground border-t py-6 text-center text-xs">
        © {new Date().getFullYear()} NEXORA — جميع الحقوق محفوظة. يتم عرض المحتوى المرخّص أو
        المملوك لنا فقط.
      </div>
    </footer>
  );
}
