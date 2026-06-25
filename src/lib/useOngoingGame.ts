"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";

/**
 * How many games a player may have running at once. One for now — but kept as a
 * named constant so it can be raised later (e.g. simultaneous games) without
 * hunting through the code.
 */
export const MAX_ONGOING_GAMES = 1;

const MY_ONGOING = gql`
  query MyOngoingGames {
    myGames {
      id
      status
      white { id username }
      black { id username }
    }
  }
`;

interface OngoingGame {
  id: string;
  status: string;
  white: { id: string; username: string };
  black: { id: string; username: string };
}

/**
 * The player's in-progress games (PENDING = accepted/awaiting first move, ACTIVE
 * = under way). Used to auto-return the player to their game and to stop them
 * starting more than MAX_ONGOING_GAMES at once.
 */
export function useOngoingGame() {
  const { user } = useAuth();
  const { data, loading } = useQuery<{ myGames: OngoingGame[] }>(MY_ONGOING, {
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
    pollInterval: 30000,
  });
  const ongoing = (data?.myGames ?? []).filter((g) => g.status === "ACTIVE" || g.status === "PENDING");
  return {
    ongoing,
    ongoingId: ongoing[0]?.id ?? null,
    count: ongoing.length,
    atLimit: ongoing.length >= MAX_ONGOING_GAMES,
    loading,
  };
}
