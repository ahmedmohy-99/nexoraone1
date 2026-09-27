export const WHATSAPP_NUMBER = "201034663437";

export function waLink(message: string, number: string = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const waGeneral = "السلام عليكم، أريد التواصل مع فريق NEXORA.";

export function waServiceMessage(serviceName: string) {
  return `السلام عليكم، أريد طلب خدمة: ${serviceName} من NEXORA.`;
}

export function waRequestMessage(data: {
  name: string;
  projectName: string;
  phone: string;
  adType: string;
  size: string;
  details: string;
  notes?: string;
}) {
  return [
    "السلام عليكم، أريد طلب تصميم إعلان من NEXORA.",
    `الاسم: ${data.name}`,
    `اسم المشروع: ${data.projectName}`,
    `رقم الهاتف: ${data.phone}`,
    `نوع الإعلان: ${data.adType}`,
    `المقاس المطلوب: ${data.size}`,
    `تفاصيل المشروع: ${data.details}`,
    data.notes ? `ملاحظات: ${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
