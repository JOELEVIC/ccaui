"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { MY_CHALLENGES } from "@/graphql/challenges";
import { toaster } from "@/lib/toaster";
import { useAuth } from "@/lib/auth";

const ONGOING_GAMES = gql`
  query OngoingGames {
    myGames(status: ACTIVE) {
      id
    }
  }
`;

interface ChallengeNote {
  id: string;
  creator: { id: string; username: string };
}

/**
 * Lightweight in-app notifications: polls for challenges addressed to me and
 * games in progress, exposes a badge count, and toasts when a brand-new
 * incoming challenge appears. No new infrastructure — just the existing API.
 */
export function useGameNotifications() {
  const { user } = useAuth();
  const meId = user?.id;

  const { data: chData } = useQuery<{ myChallenges: ChallengeNote[] }>(MY_CHALLENGES, {
    pollInterval: 20000,
    skip: !meId,
    fetchPolicy: "cache-and-network",
  });
  const { data: ogData } = useQuery<{ myGames: { id: string }[] }>(ONGOING_GAMES, {
    pollInterval: 30000,
    skip: !meId,
    fetchPolicy: "cache-and-network",
  });

  const incoming = (chData?.myChallenges ?? []).filter((c) => c.creator.id !== meId);
  const incomingCount = incoming.length;
  const ongoingCount = ogData?.myGames?.length ?? 0;
  const incomingKey = incoming.map((c) => c.id).join(",");

  // Toast only genuinely-new incoming challenges (skip the first load).
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  useEffect(() => {
    if (!primed.current) {
      primed.current = true;
      seen.current = new Set(incoming.map((c) => c.id));
      return;
    }
    for (const c of incoming) {
      if (!seen.current.has(c.id)) {
        toaster.create({ title: `${c.creator.username} challenged you`, type: "info" });
      }
    }
    seen.current = new Set(incoming.map((c) => c.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingKey]);

  return { incomingCount, ongoingCount, total: incomingCount + ongoingCount };
}
