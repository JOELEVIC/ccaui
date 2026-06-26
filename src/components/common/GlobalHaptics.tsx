"use client";

import { useEffect } from "react";
import { haptic } from "@/lib/haptics";

// Anything that should feel like a press.
const INTERACTIVE =
  "button, a, [role='button'], [role='tab'], [role='switch'], label, summary, select, " +
  "input[type='checkbox'], input[type='radio'], input[type='submit'], input[type='button'], [data-haptic]";

/**
 * App-wide touch haptics: a tiny vibration when a finger/pen presses an
 * interactive element. Mouse input is ignored (a buzz on click would be odd),
 * and it self-disables where the Vibration API isn't available (e.g. iOS).
 */
export function GlobalHaptics() {
  useEffect(() => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;

    let last = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return; // touch / pen only
      const target = e.target as Element | null;
      if (!target?.closest?.(INTERACTIVE)) return;
      const now = Date.now();
      if (now - last < 40) return; // de-dupe rapid duplicate events
      last = now;
      haptic(8);
    };

    document.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () =>
      document.removeEventListener("pointerdown", onDown, { capture: true } as EventListenerOptions);
  }, []);

  return null;
}
