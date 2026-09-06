"use client";

/**
 * TrackedLink — island analitik WA click (SYSTEM_DESIGN §8).
 * sendBeacon fire-and-forget, tanpa cookie, tanpa redirect.
 * Link tetap wa.me langsung — beacon hanya observasi.
 */
import type { ReactNode, MouseEvent } from "react";

export type TrackedEventType = "wa_click" | "wa_product_click" | "outbound";

function beacon(t: TrackedEventType, p?: string) {
  try {
    const payload = JSON.stringify({ t, p, r: document.referrer || "" });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/t", payload);
    }
  } catch {
    /* analitik tidak boleh pernah mematahkan klik */
  }
}

export function TrackedLink({
  href,
  event,
  productId,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  event: TrackedEventType;
  productId?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const onClick = (_e: MouseEvent) => {
    beacon(event, productId);
    // tidak pernah preventDefault — klik WA selalu jalan
  };
  return (
    <a
      href={href}
      onClick={onClick}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
