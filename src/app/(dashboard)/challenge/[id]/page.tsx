"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { Box, Text, VStack, HStack, Spinner } from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { useAuth } from "@/lib/auth";
import { GlassCard, LuxuryButton, LuxuryHeading, LuxuryEyebrow } from "@/components/luxury/LuxuryPrimitives";
import { CHALLENGE, ACCEPT_CHALLENGE, DECLINE_CHALLENGE } from "@/graphql/challenges";

interface ChallengeData {
  challenge: {
    id: string;
    creatorColor: string;
    timeControl: string;
    rated: boolean;
    status: string;
    creator: { id: string; username: string; rating: number };
    opponent?: { id: string; username: string } | null;
    game?: { id: string } | null;
  } | null;
}

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  const { data, loading } = useQuery<ChallengeData>(CHALLENGE, { variables: { id }, skip: !id });
  const [acceptChallenge, { loading: accepting }] = useMutation<{ acceptChallenge: { id: string } }>(ACCEPT_CHALLENGE);
  const [declineChallenge, { loading: declining }] = useMutation(DECLINE_CHALLENGE);

  const c = data?.challenge;
  const mine = !!user && !!c && c.creator.id === user.id;
  const myColor =
    c?.creatorColor === "random" ? "a random color" : c?.creatorColor === "white" ? "Black" : "White";

  async function onAccept() {
    try {
      const { data: res } = await acceptChallenge({ variables: { challengeId: id } });
      const gameId = res?.acceptChallenge?.id;
      if (gameId) router.push(`/game/${gameId}`);
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Couldn't accept", type: "error" });
    }
  }
  async function onDecline() {
    try {
      await declineChallenge({ variables: { challengeId: id } });
      toaster.create({ title: "Challenge declined", type: "info" });
      router.push("/games");
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Couldn't decline", type: "error" });
    }
  }

  return (
    <Box maxW="560px" mx="auto" pt={{ base: 4, md: 10 }}>
      <GlassCard hero>
        <Box px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
          {loading ? (
            <HStack justify="center" py={8}><Spinner color="var(--lux-gold)" /></HStack>
          ) : !c ? (
            <Centered title="Challenge not found" sub="This invite may have expired or been withdrawn." />
          ) : c.status === "ACCEPTED" && c.game ? (
            <Centered title="Already accepted" sub="This challenge has started.">
              <LuxuryButton variant="gold" size="md" glyph="▸" href={`/game/${c.game.id}`}>Go to the game</LuxuryButton>
            </Centered>
          ) : c.status !== "OPEN" ? (
            <Centered title="No longer available" sub={`This challenge is ${c.status.toLowerCase()}.`}>
              <LuxuryButton variant="ghost" size="md" href="/games">Back to play</LuxuryButton>
            </Centered>
          ) : (
            <VStack align="stretch" gap={5}>
              <LuxuryEyebrow>{mine ? "Your invite" : "Challenge"}</LuxuryEyebrow>
              <LuxuryHeading size="lg">
                {mine ? "Waiting for an opponent" : `${c.creator.username} wants to play`}
              </LuxuryHeading>

              <VStack align="stretch" gap={2.5}>
                <DetailRow label="Opponent" value={`${c.creator.username} · ${c.creator.rating}`} />
                <DetailRow label="Time control" value={c.timeControl} />
                <DetailRow label="Mode" value={c.rated ? "Ranked — affects rating" : "Casual — no rating change"} />
                {!mine && <DetailRow label="You play" value={myColor} />}
              </VStack>

              {mine ? (
                <Text fontSize="sm" color="var(--lux-text-muted)">
                  Share this link — whoever opens it and accepts will start the game with you.
                </Text>
              ) : (
                <HStack gap={3} pt={1}>
                  <LuxuryButton variant="gold" size="md" glyph="▸" onClick={onAccept} disabled={accepting}>
                    {accepting ? "Starting…" : "Accept & play"}
                  </LuxuryButton>
                  <LuxuryButton variant="ghost" size="md" onClick={onDecline} disabled={declining}>
                    Decline
                  </LuxuryButton>
                </HStack>
              )}
            </VStack>
          )}
        </Box>
      </GlassCard>
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack justify="space-between" align="center" px={4} py={3} borderRadius="8px"
      bg="var(--lux-glass-surface)" borderWidth="1px" borderColor="var(--lux-glass-border)">
      <Text fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="var(--lux-text-muted)">{label}</Text>
      <Text fontSize="sm" color="var(--lux-text-primary)" fontWeight="600">{value}</Text>
    </HStack>
  );
}

function Centered({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return (
    <VStack gap={3} py={6} textAlign="center">
      <LuxuryHeading size="md">{title}</LuxuryHeading>
      <Text fontSize="sm" color="var(--lux-text-muted)">{sub}</Text>
      {children && <Box pt={2}>{children}</Box>}
    </VStack>
  );
}
