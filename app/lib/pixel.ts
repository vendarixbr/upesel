export const PIXEL_ID = "1723014578387937";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

/* ── Standard events ── */

export function pixelViewContent(opts: {
  content_name: string;
  content_ids: string[];
  value: number;
  currency?: string;
}) {
  fbq("track", "ViewContent", {
    content_name: opts.content_name,
    content_ids:  opts.content_ids,
    content_type: "product",
    value:        opts.value,
    currency:     opts.currency ?? "BRL",
  });
}

export function pixelAddToCart(opts: {
  content_name: string;
  content_ids: string[];
  value: number;
  currency?: string;
}) {
  fbq("track", "AddToCart", {
    content_name: opts.content_name,
    content_ids:  opts.content_ids,
    content_type: "product",
    value:        opts.value,
    currency:     opts.currency ?? "BRL",
  });
}

export function pixelInitiateCheckout(opts: {
  value: number;
  num_items?: number;
  currency?: string;
}) {
  fbq("track", "InitiateCheckout", {
    value:     opts.value,
    num_items: opts.num_items ?? 1,
    currency:  opts.currency ?? "BRL",
  });
}

export function pixelAddPaymentInfo(opts: { value: number; currency?: string }) {
  fbq("track", "AddPaymentInfo", {
    value:    opts.value,
    currency: opts.currency ?? "BRL",
  });
}

export function pixelPurchase(opts: {
  value: number;
  order_id?: string;
  currency?: string;
}) {
  fbq("track", "Purchase", {
    value:        opts.value,
    currency:     opts.currency ?? "BRL",
    content_ids:  ["IU1074-417"],
    content_type: "product",
    content_name: "Camisa Brasil Jordan II 2026/27",
    ...(opts.order_id ? { order_id: opts.order_id } : {}),
  });
}
