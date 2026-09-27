import { MessageCircle } from "lucide-react";
import { waGeneral, waLink } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
    <a
      href={waLink(waGeneral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="bg-whatsapp text-whatsapp-foreground fixed bottom-5 left-5 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
