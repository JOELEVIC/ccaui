"use client";

import { Box, Heading, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  PLAYERS_LEADERBOARD,
  RATING_DISTRIBUTION,
  SOONEST_TOURNAMENTS,
} from "@/graphql/queries/chessPro";

const LIVE_GAMES = gql`
  query PlayersLiveGames {
    liveGames {
      id
      timeControl
      white {
        username
        rating
      }
      black {
        username
        rating
      }
    }
  }
`;

function flagEmoji(code: string | undefined): string {
  if (!code || code.length !== 2) return "🌐";
  const A = 0x1f1e6;
  const c = code.toUpperCase();
  return String.fromCodePoint(A + c.charCodeAt(0) - 65, A + c.charCodeAt(1) - 65);
}

function MiniTrend({ values }: { values: number[] }) {
  const data = values.map((y, i) => ({ i, y }));
  if (data.length < 2) return <Box w="56px" h="28px" />;
  return (
    <Box w="64px" h="32px">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="y" stroke="var(--accent-green, #4caf50)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

type LbRow = {
  rank: number;
  rating: number;
  gamesPlayed: number;
  ratingTrend: number[];
  user: { username: string; profile?: { chessTitle?: string | null; country?: string } };
};

export default function PlayersPage() {
  const { data: lb } = useQuery<{ playersLeaderboard: LbRow[] }>(PLAYERS_LEADERBOARD, { variables: { limit: 50 } });
  const { data: dist } = useQuery<{ ratingDistribution: { ratingMin: number; count: number }[] }>(RATING_DISTRIBUTION);
  const { data: soon } = useQuery<{ soonestTournaments: { id: string; name: string; startDate: string }[] }>(
    SOONEST_TOURNAMENTS,
    { variables: { limit: 5 } }
  );
  const { data: live } = useQuery<{ liveGames: { id: string; white: { username: string }; black: { username: string } }[] }>(
    LIVE_GAMES
  );

  const rows = lb?.playersLeaderboard ?? [];
  const buckets = dist?.ratingDistribution ?? [];
  const chartData = buckets.map((b: { ratingMin: number; count: number }) => ({
    name: `${b.ratingMin}`,
    c: b.count,
  }));
  const tournaments = soon?.soonestTournaments ?? [];
  const liveGames = live?.liveGames ?? [];
  const top = rows.slice(0, 10);

  return (
    <Flex align="flex-start" gap={8} flexDir={{ base: "column", xl: "row" }}>
      <Box flex={1} minW={0}>
        <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary" mb={6}>
          Players
        </Heading>
        <Box overflowX="auto">
          <Box as="table" w="full" fontSize="sm" minW="600px">
            <Box as="thead">
              <Box as="tr" borderBottomWidth="1px" borderColor="whiteAlpha.100">
                <Text as="th" textAlign="left" py={3} color="textMuted" fontWeight="600">
                  #
                </Text>
                <Text as="th" textAlign="left" py={3} color="textMuted" fontWeight="600">
                  Player
                </Text>
                <Text as="th" textAlign="right" py={3} color="textMuted" fontWeight="600">
                  Rating
                </Text>
                <Text as="th" textAlign="right" py={3} color="textMuted" fontWeight="600">
                  Games
                </Text>
                <Text as="th" textAlign="right" py={3} color="textMuted" fontWeight="600">
                  Form
                </Text>
              </Box>
            </Box>
            <Box as="tbody">
              {rows.map((row: LbRow) => (
                  <Box
                    as="tr"
                    key={row.user.username}
                    borderBottomWidth="1px"
                    borderColor="whiteAlpha.060"
                    _hover={{ bg: "whiteAlpha.04" }}
                  >
                    <Text as="td" py={3} color="textMuted">
                      {row.rank}
                    </Text>
                    <Text as="td" py={3}>
                      <HStack gap={2}>
                        <Text>{flagEmoji(row.user.profile?.country)}</Text>
                        <Text color="gold" fontWeight="600">
                          {row.user.profile?.chessTitle ? `${row.user.profile.chessTitle} ` : ""}
                          {row.user.username}
                        </Text>
                      </HStack>
                    </Text>
                    <Text as="td" py={3} textAlign="right" fontWeight="700">
                      {row.rating}
                    </Text>
                    <Text as="td" py={3} textAlign="right" color="textSecondary">
                      {row.gamesPlayed}
                    </Text>
                    <Text as="td" py={3} textAlign="right">
                      <MiniTrend values={row.ratingTrend ?? []} />
                    </Text>
                  </Box>
                )
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <VStack align="stretch" gap={6} w={{ base: "full", xl: "340px" }} flexShrink={0}>
        <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="gold" mb={3}>
            Rating distribution
          </Text>
          <Box h="140px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: "#6b728e", fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="c" stroke="#e6a452" fill="#e6a452" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="gold" mb={3}>
            Soonest tournaments
          </Text>
          <VStack align="stretch" gap={2}>
            {tournaments.map((t) => (
              <Box key={t.id} py={2} borderBottomWidth="1px" borderColor="whiteAlpha.060">
                <Text fontSize="sm" fontWeight="600">
                  {t.name}
                </Text>
                <Text fontSize="xs" color="textMuted">
                  {new Date(t.startDate).toLocaleString()}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="gold" mb={3}>
            Live games
          </Text>
          {liveGames.length === 0 ? (
            <Text fontSize="sm" color="textMuted">
              No live games right now.
            </Text>
          ) : (
            <VStack align="stretch" gap={2}>
              {liveGames.slice(0, 3).map((g) => (
                <Text key={g.id} fontSize="sm">
                  {g.white.username} vs {g.black.username}
                </Text>
              ))}
            </VStack>
          )}
        </Box>

        <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="gold" mb={3}>
            Top 10
          </Text>
          <VStack align="stretch" gap={1}>
            {top.map((row) => (
              <HStack key={row.user.username} justify="space-between">
                <Text fontSize="sm" color="textSecondary">
                  {row.rank}. {row.user.username}
                </Text>
                <Text fontSize="sm" fontWeight="700">
                  {row.rating}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Flex>
  );
}
