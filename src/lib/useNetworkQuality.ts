"use client";

import { useEffect, useRef, useState } from "react";
import { getGameHttpOrigin } from "./game-api";

export interface NetQuality {
  bars: 0 | 1 | 2 | 3 | 4;
  latencyMs: number | null;
  online: boolean;
}

const PING_MS = 4000;

function barsFor(ms: number): 0 | 1 | 2 | 3 | 4 {
  if (ms < 150) return 4;
  if (ms < 350) return 3;
  if (ms < 800) return 2;
  return 1;
}

/**
 * Lightweight connection-quality meter for the live game, à la chess.com. Pings
 * the game server's origin every few seconds (opaque no-cors GET — we only time
 * the round trip) and smooths the last few samples into a 0–4 bar rating. When
 * the websocket itself is down, that dominates (capped low / offline).
 */
export function useNetworkQuality(active: boolean, connected: boolean): NetQuality {
  const [q, setQ] = useState<NetQuality>({ bars: 0, latencyMs: null, online: true });
  const samples = useRef<number[]>([]);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    const origin = getGameHttpOrigin();
    if (!origin) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      if (stopped) return;
      const start = performance.now();
      try {
        await fetch(`${origin}/?_p=${Date.now()}`, { mode: "no-cors", cache: "no-store" });
        const rtt = performance.now() - start;
        const arr = samples.current;
        arr.push(rtt);
        if (arr.length > 4) arr.shift();
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        setQ({ online: true, latencyMs: Math.round(avg), bars: barsFor(avg) });
      } catch {
        samples.current = [];
        setQ({ online: false, latencyMs: null, bars: 0 });
      }
      if (!stopped) timer = setTimeout(tick, PING_MS);
    }

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [active]);

  // A dropped websocket dominates the felt quality regardless of ping.
  if (!connected) {
    return { bars: q.online ? 1 : 0, latencyMs: q.latencyMs, online: q.online };
  }
  return q;
}
