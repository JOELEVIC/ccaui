"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, type SubscribePayload } from "graphql-ws";
import { getGameWsUrl } from "./game-api";
import type { GameUpdatePayload } from "./game-api";

const GAME_UPDATED = `
  subscription GameUpdated($gameId: ID!) {
    gameUpdated(gameId: $gameId) {
      gameId event moves status result drawOfferBy move reason
    }
  }
`;

export function useGameSubscription(
  gameId: string | null,
  token: string | null,
  onPayload: (payload: GameUpdatePayload) => void
) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onPayloadRef = useRef(onPayload);
  onPayloadRef.current = onPayload;

  useEffect(() => {
    if (!gameId || !token || typeof window === "undefined") {
      setConnected(false);
      return;
    }

    const wsUrl = getGameWsUrl();
    if (!wsUrl) {
      setError("Game subscription URL not configured");
      return;
    }

    const client = createClient({
      url: wsUrl,
      connectionParams: { token },
      on: {
        connected: () => setConnected(true),
        closed: () => setConnected(false),
        error: (e) => setError(e instanceof Error ? e.message : "Connection error"),
      },
    });

    const payload: SubscribePayload = {
      query: GAME_UPDATED,
      variables: { gameId },
    };

    const unsub = client.subscribe(payload, {
      next: (result) => {
        const data = (result as { data?: { gameUpdated: GameUpdatePayload } }).data;
        if (data?.gameUpdated) onPayloadRef.current(data.gameUpdated);
      },
      error: (err) => setError(err instanceof Error ? err.message : "Subscription error"),
      complete: () => setConnected(false),
    });

    return () => {
      unsub();
      client.terminate();
      setConnected(false);
      setError(null);
    };
  }, [gameId, token]);

  return { connected, error };
}
