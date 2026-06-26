"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { Box, Button, Dialog, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { toaster } from "@/lib/toaster";
import { MY_CHALLENGES, ACCEPT_CHALLENGE, DECLINE_CHALLENGE } from "@/graphql/challenges";

interface ChallengeNote {
  id: string;
  creatorColor: string;
  timeControl: string;
  rated: boolean;
  status: string;
  creator: { id: string; username: string; rating: number };
}

/**
 * App-wide "X challenges you" prompt. Mounted in the dashboard layout so an
 * incoming challenge surfaces on ANY page (not buried in /games). Accept drops
 * you straight into the game both players share; decline ends it. Polls fast
 * because a waiting opponent shouldn't sit for 20s.
 */
export function IncomingChallengePrompt() {
  const { user } = useAuth();
  const meId = user?.id;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data, refetch } = useQuery<{ myChallenges: ChallengeNote[] }>(MY_CHALLENGES, {
    skip: !meId,
    pollInterval: 6000,
    fetchPolicy: "cache-and-network",
  });
  const [acceptChallenge] = useMutation(ACCEPT_CHALLENGE);
  const [declineChallenge] = useMutation(DECLINE_CHALLENGE);

  const incoming = (data?.myChallenges ?? []).filter(
    (c) => c.status === "OPEN" && c.creator.id !== meId && !dismissed.has(c.id)
  );
  const ch = incoming[0] ?? null;

  async function onAccept() {
    if (!ch) return;
    setBusy(true);
    try {
      const { data: res } = await acceptChallenge({ variables: { challengeId: ch.id } });
      const gameId = (res as { acceptChallenge?: { id: string } } | null | undefined)?.acceptChallenge?.id;
      if (gameId) router.push(`/game/${gameId}`);
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Couldn't accept", type: "error" });
      setDismissed((s) => new Set(s).add(ch.id));
    } finally {
      setBusy(false);
    }
  }

  async function onDecline() {
    if (!ch) return;
    setDismissed((s) => new Set(s).add(ch.id));
    try {
      await declineChallenge({ variables: { challengeId: ch.id } });
      await refetch();
    } catch {
      /* it'll fall out of myChallenges on the next poll */
    }
  }

  if (!ch) return null;

  const colorNote =
    ch.creatorColor === "white" ? "you play Black" : ch.creatorColor === "black" ? "you play White" : "random colours";

  return (
    <Dialog.Root open onOpenChange={(d) => { if (!d.open) setDismissed((s) => new Set(s).add(ch.id)); }}>
      <Dialog.Backdrop bg="blackAlpha.700" />
      <Dialog.Positioner>
        <Dialog.Content bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="soft" maxW="sm" mx={4}>
          <Dialog.Body pt={7} pb={3}>
            <Text color="gold" fontSize="xs" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase" textAlign="center">
              Challenge
            </Text>
            <Text textAlign="center" fontSize="2xl" fontWeight="800" color="textPrimary" mt={2}>
              {ch.creator.username}
            </Text>
            <Text textAlign="center" color="textSecondary" fontSize="sm" mt={1}>
              {ch.creator.rating} · {ch.timeControl} · {ch.rated ? "Rated" : "Casual"}
            </Text>
            <Text textAlign="center" color="textMuted" fontSize="xs" mt={1}>
              {colorNote}
            </Text>
          </Dialog.Body>
          <Dialog.Footer flexDirection="column" gap={2} pb={6} px={6}>
            <VStack width="full" gap={2}>
              <Button
                width="full"
                bg="gold"
                color="textPrimary"
                fontWeight="700"
                borderRadius="soft"
                _hover={{ bg: "goldLight" }}
                disabled={busy}
                onClick={onAccept}
              >
                {busy ? "Joining…" : "Accept & play"}
              </Button>
              <Box
                as="button"
                width="full"
                py={2}
                color="textSecondary"
                fontSize="sm"
                _hover={{ color: "gold" }}
                onClick={onDecline}
              >
                Decline
              </Box>
            </VStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
