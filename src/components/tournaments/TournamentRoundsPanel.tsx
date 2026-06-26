"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Badge, Box, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";

const TOURNAMENT_ROUNDS = gql`
  query TournamentRoundsView($id: ID!) {
    tournamentRounds(tournamentId: $id) {
      id
      number
      status
      pairings {
        id
        boardNumber
        whiteUserId
        blackUserId
        gameId
        result
      }
    }
    tournamentStandings(tournamentId: $id) {
      rank
      userId
      username
      rating
      score
      buchholz
      sonnebornBerger
      byes
      withdrawn
    }
  }
`;

interface Pairing {
  id: string;
  boardNumber: number;
  whiteUserId: string | null;
  blackUserId: string | null;
  gameId: string | null;
  result: string | null;
}
interface Round {
  id: string;
  number: number;
  status: string;
  pairings: Pairing[];
}
interface Standing {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  score: number;
  buchholz: number;
  sonnebornBerger: number;
  byes: number;
  withdrawn: boolean;
}

const RESULT_LABEL: Record<string, string> = {
  "1-0": "1–0",
  "0-1": "0–1",
  "1/2-1/2": "½–½",
  bye: "Bye",
};

function PairingLine({
  p,
  nameOf,
  meId,
}: {
  p: Pairing;
  nameOf: (id: string | null) => string;
  meId?: string | null;
}) {
  const isBye = p.result === "bye" || !p.blackUserId;
  const whiteWon = p.result === "1-0";
  const blackWon = p.result === "0-1";
  const mine = !!meId && (p.whiteUserId === meId || p.blackUserId === meId);
  const canPlay = mine && !isBye && !!p.gameId && !p.result;
  return (
    <HStack
      justify="space-between"
      px={3}
      py={2}
      borderRadius="cca"
      bg={mine ? "rgba(197,160,89,0.08)" : "bgSurface"}
      borderWidth="1px"
      borderColor={mine ? "gold" : "goldDark"}
      gap={3}
    >
      <HStack gap={2} minW={0} flex={1}>
        <Text fontSize="xs" color="textMuted" w="22px">
          #{p.boardNumber}
        </Text>
        <Text fontSize="sm" color="textPrimary" fontWeight={whiteWon ? "700" : "500"} truncate>
          {nameOf(p.whiteUserId)}
        </Text>
        <Text fontSize="xs" color="textMuted">
          vs
        </Text>
        <Text fontSize="sm" color="textPrimary" fontWeight={blackWon ? "700" : "500"} truncate>
          {isBye ? "—" : nameOf(p.blackUserId)}
        </Text>
      </HStack>
      {canPlay ? (
        <Link href={`/game/${p.gameId}`}>
          <Box
            as="span"
            px={3}
            py={1}
            borderRadius="full"
            bg="gold"
            color="textPrimary"
            fontSize="xs"
            fontWeight="700"
            whiteSpace="nowrap"
            _hover={{ bg: "goldLight" }}
          >
            ▶ Play
          </Box>
        </Link>
      ) : p.gameId && !p.result && !isBye ? (
        <Link href={`/game/${p.gameId}`}>
          <Text fontSize="xs" color="textMuted" _hover={{ color: "gold" }} whiteSpace="nowrap">
            Watch
          </Text>
        </Link>
      ) : (
        <Text fontSize="sm" color={p.result ? "gold" : "textMuted"} fontWeight="600" whiteSpace="nowrap">
          {p.result ? RESULT_LABEL[p.result] ?? p.result : "live"}
        </Text>
      )}
    </HStack>
  );
}

export function TournamentRoundsPanel({ tournamentId, format }: { tournamentId: string; format?: string }) {
  const { user } = useAuth();
  const meId = user?.id;
  const { data } = useQuery<{ tournamentRounds: Round[]; tournamentStandings: Standing[] }>(TOURNAMENT_ROUNDS, {
    variables: { id: tournamentId },
    pollInterval: 20000,
  });

  const rounds = [...(data?.tournamentRounds ?? [])].sort((a, b) => a.number - b.number);
  const standings = data?.tournamentStandings ?? [];

  const nameMap = new Map<string, string>();
  standings.forEach((s) => nameMap.set(s.userId, s.username));
  const nameOf = (uid: string | null) => (uid ? nameMap.get(uid) ?? "Player" : "—");

  if (rounds.length === 0 && standings.length === 0) return null;

  const isKnockout = (format ?? "").toUpperCase() === "KNOCKOUT";
  const showTiebreaks = standings.some((s) => s.buchholz > 0 || s.sonnebornBerger > 0 || s.byes > 0);

  return (
    <VStack align="stretch" gap={6}>
      {/* Live standings with tiebreaks */}
      {standings.length ? (
        <Box p={{ base: 4, md: 6 }} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="goldDark" w="full">
          <Heading size="md" color="gold" mb={4} fontFamily="var(--font-playfair), Georgia, serif">
            Live standings
          </Heading>
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
              <Box as="thead">
                <Box as="tr" color="textMuted" fontSize="xs" textTransform="uppercase" letterSpacing="0.06em">
                  <Box as="th" textAlign="left" py={2} pr={3}>#</Box>
                  <Box as="th" textAlign="left" py={2} pr={3}>Player</Box>
                  <Box as="th" textAlign="right" py={2} px={3}>Rating</Box>
                  <Box as="th" textAlign="right" py={2} px={3}>Score</Box>
                  {showTiebreaks ? (
                    <>
                      <Box as="th" textAlign="right" py={2} px={3} title="Buchholz">Buch.</Box>
                      <Box as="th" textAlign="right" py={2} px={3} title="Sonneborn-Berger">S-B</Box>
                    </>
                  ) : null}
                </Box>
              </Box>
              <Box as="tbody">
                {standings.map((s) => (
                  <Box as="tr" key={s.userId} borderTopWidth="1px" borderColor="goldDark" opacity={s.withdrawn ? 0.5 : 1}>
                    <Box as="td" py={2.5} pr={3} fontWeight="700" color="gold">{s.rank}</Box>
                    <Box as="td" py={2.5} pr={3} color="textPrimary">
                      {s.username}
                      {s.withdrawn ? <Text as="span" fontSize="xs" color="textMuted"> · withdrawn</Text> : null}
                    </Box>
                    <Box as="td" py={2.5} px={3} textAlign="right" color="textMuted">{s.rating}</Box>
                    <Box as="td" py={2.5} px={3} textAlign="right" fontWeight="700" color="textPrimary">{s.score}</Box>
                    {showTiebreaks ? (
                      <>
                        <Box as="td" py={2.5} px={3} textAlign="right" color="textMuted">{s.buchholz}</Box>
                        <Box as="td" py={2.5} px={3} textAlign="right" color="textMuted">{s.sonnebornBerger}</Box>
                      </>
                    ) : null}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}

      {/* Rounds & pairings */}
      {rounds.length ? (
        <Box p={{ base: 4, md: 6 }} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="goldDark" w="full">
          <Heading size="md" color="gold" mb={4} fontFamily="var(--font-playfair), Georgia, serif">
            {isKnockout ? "Bracket" : "Rounds & pairings"}
          </Heading>

          {isKnockout ? (
            <Box overflowX="auto" pb={2}>
              <HStack align="start" gap={5} minW="min-content">
                {rounds.map((r) => (
                  <VStack key={r.id} align="stretch" gap={2} minW="240px">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="700" color="textPrimary">
                        Round {r.number}
                      </Text>
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontSize="2xs"
                        textTransform="uppercase"
                        bg={r.status === "ONGOING" ? "gold" : "bgSurface"}
                        color={r.status === "ONGOING" ? "black" : "textMuted"}
                      >
                        {r.status.toLowerCase()}
                      </Badge>
                    </HStack>
                    {[...r.pairings]
                      .sort((a, b) => a.boardNumber - b.boardNumber)
                      .map((p) => (
                        <PairingLine key={p.id} p={p} nameOf={nameOf} meId={meId} />
                      ))}
                  </VStack>
                ))}
              </HStack>
            </Box>
          ) : (
            <VStack align="stretch" gap={5}>
              {[...rounds].reverse().map((r) => (
                <Box key={r.id}>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="700" color="textPrimary">
                      Round {r.number}
                    </Text>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="2xs"
                      textTransform="uppercase"
                      bg={r.status === "ONGOING" ? "gold" : "bgSurface"}
                      color={r.status === "ONGOING" ? "black" : "textMuted"}
                    >
                      {r.status.toLowerCase()}
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                    {[...r.pairings]
                      .sort((a, b) => a.boardNumber - b.boardNumber)
                      .map((p) => (
                        <PairingLine key={p.id} p={p} nameOf={nameOf} meId={meId} />
                      ))}
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      ) : null}
    </VStack>
  );
}
