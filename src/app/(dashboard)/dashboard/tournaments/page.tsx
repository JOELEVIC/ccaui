"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  SimpleGrid,
  Flex,
  Switch,
} from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/lib/auth";
import { TOURNAMENT_SCHEDULE, PLAYERS_LEADERBOARD, ME_TOURNAMENT_STATS } from "@/graphql/queries/chessPro";
import { TournamentSchedule, TournamentListMobile, type ScheduleTournament } from "@/components/tournaments/TournamentSchedule";

type ViewMode = "day" | "week" | "month";

type LeaderboardRow = {
  rank: number;
  rating: number;
  user: { username: string; profile?: { chessTitle?: string | null; avatarUrl?: string | null } };
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function TournamentsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>("day");
  const [cursor, setCursor] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [variant, setVariant] = useState("");
  const [joinedOnly, setJoinedOnly] = useState(false);

  const { rangeStart, rangeEnd, label } = useMemo(() => {
    if (view === "day") {
      return {
        rangeStart: startOfDay(cursor),
        rangeEnd: endOfDay(cursor),
        label: cursor.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
      };
    }
    if (view === "week") {
      const start = startOfDay(addDays(cursor, -cursor.getDay()));
      const end = endOfDay(addDays(start, 6));
      return {
        rangeStart: start,
        rangeEnd: end,
        label: `Week of ${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
      };
    }
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      rangeStart: start,
      rangeEnd: end,
      label: cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    };
  }, [cursor, view]);

  const { data, loading } = useQuery<{
    tournamentSchedule: ScheduleTournament[];
  }>(TOURNAMENT_SCHEDULE, {
    variables: {
      rangeStart: rangeStart.toISOString(),
      rangeEnd: rangeEnd.toISOString(),
      search: search.trim() || null,
      chessVariant: variant.trim() || null,
      joinedOnly: joinedOnly || null,
    },
  });

  const { data: lbData } = useQuery<{ playersLeaderboard: LeaderboardRow[] }>(PLAYERS_LEADERBOARD, {
    variables: { limit: 10 },
  });
  const { data: statsData } = useQuery<{ meTournamentStats: { totalJoined: number; breakdown: { variant: string; count: number }[] } }>(ME_TOURNAMENT_STATS);

  const list = data?.tournamentSchedule ?? [];
  const leaderboard = lbData?.playersLeaderboard ?? [];
  const stats = statsData?.meTournamentStats;

  return (
    <VStack align="stretch" gap={8}>
      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
        <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary">
          Tournaments
        </Heading>
        <Button bg="bgSurface" color="textPrimary" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="soft" size="sm">
          + Create tournament
        </Button>
      </Flex>

      <HStack flexWrap="wrap" gap={2}>
        {(["day", "week", "month"] as const).map((v) => (
          <Button
            key={v}
            size="sm"
            variant={view === v ? "solid" : "ghost"}
            bg={view === v ? "whiteAlpha.10" : "transparent"}
            borderWidth="1px"
            borderColor={view === v ? "gold" : "transparent"}
            color={view === v ? "gold" : "textSecondary"}
            borderRadius="soft"
            onClick={() => setView(v)}
            textTransform="capitalize"
          >
            {v}
          </Button>
        ))}
      </HStack>

      <HStack justify="center" flexWrap="wrap" gap={4}>
        <Button variant="ghost" size="sm" onClick={() => setCursor(addDays(cursor, view === "day" ? -1 : view === "week" ? -7 : -31))}>
          ←
        </Button>
        <Text fontWeight="600" color="textPrimary">
          {label}
        </Text>
        <Button variant="ghost" size="sm" onClick={() => setCursor(addDays(cursor, view === "day" ? 1 : view === "week" ? 7 : 31))}>
          →
        </Button>
      </HStack>

      <HStack flexWrap="wrap" gap={3}>
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="240px"
          bg="bgCard"
          borderColor="whiteAlpha.100"
          borderRadius="soft"
          size="sm"
        />
        <Input
          placeholder="Chess variant"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
          maxW="160px"
          bg="bgCard"
          borderColor="whiteAlpha.100"
          borderRadius="soft"
          size="sm"
        />
        <HStack gap={2}>
          <Text fontSize="sm" color="textSecondary">
            I joined
          </Text>
          <Switch.Root
            checked={joinedOnly}
            onCheckedChange={(e) => setJoinedOnly(!!e.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>
      </HStack>

      {loading ? (
        <Text color="textMuted">Loading schedule…</Text>
      ) : (
        <>
          <Box display={{ base: "block", lg: "none" }}>
            <TournamentListMobile tournaments={list} currentUserId={user?.id} />
          </Box>
          <Box display={{ base: "none", lg: "block" }} overflowX="auto">
            <TournamentSchedule day={cursor} tournaments={list} currentUserId={user?.id} />
          </Box>
        </>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} pt={8}>
        <Box>
          <Heading size="md" color="gold" mb={4} fontFamily="var(--font-playfair), Georgia, serif">
            Top 10 players
          </Heading>
          <VStack align="stretch" gap={2}>
            {leaderboard.map((row: LeaderboardRow) => (
                <HStack
                  key={row.user.username}
                  justify="space-between"
                  py={2}
                  px={3}
                  borderRadius="soft"
                  bg="bgCard"
                  borderWidth="1px"
                  borderColor="whiteAlpha.060"
                >
                  <HStack gap={3}>
                    <Text color="textMuted" w="24px">
                      {row.rank}
                    </Text>
                    <Text color="gold" fontWeight="600">
                      {row.user.profile?.chessTitle ? `${row.user.profile.chessTitle} ` : ""}
                      {row.user.username}
                    </Text>
                  </HStack>
                  <Text fontWeight="700">{row.rating}</Text>
                </HStack>
              )
            )}
          </VStack>
        </Box>
        <Box>
          <Heading size="md" color="gold" mb={4} fontFamily="var(--font-playfair), Georgia, serif">
            My tournament stats
          </Heading>
          <Text fontSize="sm" color="textSecondary" mb={3}>
            Tournaments you joined (by variant). Rank avg reflects your arena performance.
          </Text>
          <Text fontSize="lg" fontWeight="700" color="textPrimary" mb={2}>
            Total joined: {stats?.totalJoined ?? 0}
          </Text>
          <VStack align="stretch" gap={1}>
            {stats?.breakdown?.map((b: { variant: string; count: number }) => (
              <HStack key={b.variant} justify="space-between">
                <Text color="textSecondary">{b.variant}</Text>
                <Text color="gold">{b.count}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>

    </VStack>
  );
}
