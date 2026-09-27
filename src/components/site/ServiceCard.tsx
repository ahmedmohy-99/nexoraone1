import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/data";
import { egp } from "@/lib/format";
import { waLink, waServiceMessage } from "@/lib/whatsapp";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="glass card-hover overflow-hidden rounded-3xl">
      <div className="bg-secondary/40 aspect-[10/7] overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold">{service.name}</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-7">{service.description}</p>
        <p className="mt-4 text-sm">
          يبدأ من <span className="text-primary text-lg font-extrabold">{egp(Number(service.start_price))}</span>
        </p>
        <Button variant="whatsapp" className="mt-5 w-full" asChild>
          <a
            href={waLink(waServiceMessage(service.name))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle />
            اطلب الخدمة
          </a>
        </Button>
      </div>
    </article>
  );
}
