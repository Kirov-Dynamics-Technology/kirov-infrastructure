import { createClient } from "./client";

export type TrackEvent = { name: string; data?: Record<string, unknown> };

/**
 * Umami-analytics event hook. Fails closed: tracking never breaks the page.
 * Usage: track('assessment_complete', { score: 82 });
 */
export function track(name: string, data?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && window.umami?.track) {
      window.umami.track(name, data);
    }
  } catch {
    /* no-op */
  }
}

/**
 * Umami sends the site's "customDomain" as the page domain when configured;
 * keep the snippet's data-domains in sync (see index.html head).
 */

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void;
    };
  }
}