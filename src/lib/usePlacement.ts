"use client";

import { useQuery } from "@apollo/client/react";
import { apolloClient } from "./apollo-client";
import { useAuth } from "@/lib/auth";
import {
  PLACEMENT_STATUS,
  START_PLACEMENT,
  SAVE_PLACEMENT_PROGRESS,
  SUBMIT_PLACEMENT,
} from "@/graphql/placement";
import type { PlacementMoveStat } from "@/lib/placement/analyzeGame";

export interface PlacementStatus {
  required: boolean;
  completedAt: string | null;
  activeRunId: string | null;
}

/** A finished placement game, in the shape the server's PlacementGameInput expects. */
export interface PlacementGamePayload {
  botId: string;
  botElo: number;
  color: "w" | "b";
  score: number; // 1 | 0.5 | 0 (user perspective)
  moves: string; // space-joined UCI for audit
  userMoves: PlacementMoveStat[];
}

export interface PlacementEstimate {
  rating: number;
  rd: number;
  confidence: number;
  resultRating: number;
  moveRating: number;
  acplRating: number;
  accuracyRating: number;
  weightedAcpl: number;
  meanAccuracy: number;
  totalUserMoves: number;
  gamesScored: number;
}

/** Lightweight status query, used by the recurring prompt. */
export function usePlacementStatus() {
  const { user } = useAuth();
  const { data, loading, refetch } = useQuery<{ placementStatus: PlacementStatus }>(
    PLACEMENT_STATUS,
    { skip: !user?.id, fetchPolicy: "cache-and-network" }
  );
  return {
    status: data?.placementStatus ?? null,
    required: !!data?.placementStatus?.required,
    loading,
    refetch,
  };
}

export async function startPlacementRun(): Promise<string> {
  const { data } = await apolloClient.mutate<{ startPlacement: { id: string } }>({
    mutation: START_PLACEMENT,
  });
  const id = data?.startPlacement?.id;
  if (!id) throw new Error("Could not start placement");
  return id;
}

export async function savePlacementProgress(
  runId: string,
  games: PlacementGamePayload[]
): Promise<void> {
  await apolloClient.mutate({
    mutation: SAVE_PLACEMENT_PROGRESS,
    variables: { runId, games },
  });
}

export async function submitPlacementRun(
  runId: string,
  games: PlacementGamePayload[]
): Promise<{ newRating: number; estimate: PlacementEstimate }> {
  const { data } = await apolloClient.mutate<{
    submitPlacement: { newRating: number; estimate: PlacementEstimate };
  }>({
    mutation: SUBMIT_PLACEMENT,
    variables: { runId, games },
  });
  if (!data?.submitPlacement) throw new Error("Placement submission failed");
  return data.submitPlacement;
}
