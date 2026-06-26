"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOngoingGame } from "@/lib/useOngoingGame";

/**
 * App-entry "resume your game" redirect. On a fresh load / refresh into the
 * logged-in area, if the player has a game under way, take them straight to it.
 *
 * Fires once per mount, so deliberate in-session navigation isn't yanked back —
 * a refresh re-resumes. Anything under /game* is skipped: /game/<id> is the game
 * itself, and /games is the lobby that acts as the escape hatch.
 */
export function OngoingGameRedirect() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { ongoingId, loading } = useOngoingGame();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || loading || !ongoingId) return;
    if (pathname.startsWith("/game")) return; // game page + /games lobby = escape hatch
    done.current = true;
    router.replace(`/game/${ongoingId}`);
  }, [ongoingId, loading, pathname, router]);

  return null;
}
