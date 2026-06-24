"use client";

import { useEffect } from "react";
import { getCcaApiBase } from "@/lib/game-api";

/**
 * Silently warms the live game server. The cca service runs on Render's free
 * tier, which sleeps after ~15 min idle and cold-starts in ~30s — so the first
 * person to open a live game otherwise stalls on "Connecting to live server…".
 *
 * Pinging /health on load (and occasionally while the tab is open) means the
 * dyno is already awake by the time a player gets there. Fire-and-forget,
 * no-cors, all failures ignored — it never affects the page.
 */
export function ServerWarmup() {
  useEffect(() => {
    const base = getCcaApiBase();
    if (!base) return;
    const url = `${base}/health`;

    const ping = () => {
      try {
        void fetch(url, { mode: "no-cors", cache: "no-store", keepalive: true }).catch(() => {});
      } catch {
        /* ignore */
      }
    };

    ping(); // warm immediately on first load, regardless of tab visibility

    // Keep it warm during an active session — but only while the tab is open
    // and visible, so a backgrounded/forgotten tab doesn't ping forever.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") ping();
    }, 10 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
