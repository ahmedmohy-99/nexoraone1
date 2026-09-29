import { useEffect, useRef } from "react";

const CLIENT_ID = "ca-pub-5943262431882372";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  /** معرّف الوحدة الإعلانية من حساب Google AdSense (اختياري مع الإعلانات التلقائية) */
  slot?: string;
  className?: string;
  format?: string;
};

export function AdSlot({ slot, className, format = "auto" }: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // تجاهل: مانع الإعلانات أو عدم تحميل السكربت
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client={CLIENT_ID}
        {...(slot ? { "data-ad-slot": slot } : {})}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
