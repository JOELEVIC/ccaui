"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";

const SLOT_MIN = 10;
const PX_PER_SLOT = 28;
const DAY_START_MIN = 9 * 60;
const DAY_END_MIN = 23 * 60;

export interface ScheduleTournament {
  id: string;
  name: string;
  startDate: string;
  endDate?: string | null;
  chessVariant: string;
  arenaTimeControl: string;
  cardColor: string;
  isSponsored: boolean;
  isRated: boolean;
  iconType?: string | null;
  currentPlayers: number;
  maxPlayers: number;
  participants: { user: { id: string } }[];
}

function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function colorForCard(c: string): string {
  const map: Record<string, string> = {
    tan: "rgba(212, 165, 116, 0.95)",
    blue: "rgba(100, 149, 237, 0.9)",
    lime: "rgba(124, 200, 90, 0.95)",
    purple: "rgba(186, 148, 214, 0.9)",
  };
  return map[c] ?? "rgba(100, 149, 237, 0.85)";
}

export interface TournamentScheduleProps {
  day: Date;
  tournaments: ScheduleTournament[];
  currentUserId?: string;
}

export function TournamentSchedule({ day, tournaments, currentUserId }: TournamentScheduleProps) {
  const [nowTick, setNowTick] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNowTick(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const slots = useMemo(() => {
    const list: { label: string; min: number }[] = [];
    for (let m = DAY_START_MIN; m <= DAY_END_MIN; m += SLOT_MIN) {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      list.push({
        label: `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
        min: m,
      });
    }
    return list;
  }, []);

  const gridHeight = (slots.length - 1) * PX_PER_SLOT;

  const positioned = useMemo(() => {
    const y0 = DAY_START_MIN;
    return tournaments
      .map((t) => {
        const start = new Date(t.startDate);
        const end = t.endDate ? new Date(t.endDate) : new Date(start.getTime() + 60 * 60 * 1000);
        if (!isSameDay(start, day)) return null;
        const startM = minutesSinceMidnight(start);
        const endM = Math.min(minutesSinceMidnight(end), DAY_END_MIN + SLOT_MIN);
        const top = ((startM - y0) / SLOT_MIN) * PX_PER_SLOT;
        const height = Math.max(((endM - startM) / SLOT_MIN) * PX_PER_SLOT, PX_PER_SLOT * 1.5);
        const joined = currentUserId ? t.participants.some((p) => p.user.id === currentUserId) : false;
        return { t, top, height, joined };
      })
      .filter(Boolean) as { t: ScheduleTournament; top: number; height: number; joined: boolean }[];
  }, [tournaments, day, currentUserId]);

  const nowLine =
    isSameDay(nowTick, day) ? ((minutesSinceMidnight(nowTick) - DAY_START_MIN) / SLOT_MIN) * PX_PER_SLOT : null;

  return (
    <Flex gap={0} w="full" minH={`${gridHeight + 40}px`} position="relative">
      <VStack align="stretch" gap={0} w="52px" flexShrink={0} pt={6} pr={1}>
        {slots.map((s) => (
          <Box key={s.label} h={`${PX_PER_SLOT}px`} flexShrink={0}>
            <Text fontSize="10px" color="textMuted" lineHeight="1">
              {s.label}
            </Text>
          </Box>
        ))}
      </VStack>
      <Box flex={1} position="relative" borderLeftWidth="1px" borderColor="whiteAlpha.100" minW={0}>
        {slots.slice(0, -1).map((s) => (
          <Box
            key={s.label}
            position="absolute"
            left={0}
            right={0}
            top={`${((s.min - DAY_START_MIN) / SLOT_MIN) * PX_PER_SLOT + 24}px`}
            h={`${PX_PER_SLOT}px`}
            borderTopWidth="1px"
            borderColor="whiteAlpha.060"
            pointerEvents="none"
          />
        ))}
        {nowLine != null && nowLine >= 0 && nowLine <= gridHeight + 24 && (
          <Box
            position="absolute"
            left={0}
            right={0}
            top={`${nowLine + 24}px`}
            borderTopWidth="2px"
            borderStyle="dashed"
            borderColor="accentGreen"
            zIndex={2}
            pointerEvents="none"
          />
        )}
        <Box position="relative" h={`${gridHeight + 24}px`} mt={6}>
          {positioned.map(({ t, top, height, joined }) => (
            <Box
              key={t.id}
              position="absolute"
              left={2}
              right={2}
              top={`${top}px`}
              h={`${height}px`}
              borderRadius="soft"
              px={2}
              py={1}
              bg={colorForCard(t.cardColor)}
              color="#0a0e1a"
              overflow="hidden"
              zIndex={1}
              boxShadow="md"
              borderWidth={t.isSponsored ? "2px" : "0"}
              borderColor="goldDark"
            >
              <HStack justify="space-between" align="flex-start" gap={1}>
                <Text fontWeight="700" fontSize="xs" lineClamp={2}>
                  {t.iconType === "lightning" ? "⚡ " : t.iconType === "rabbit" ? "🐇 " : t.iconType === "fire" ? "🔥 " : ""}
                  {t.name}
                </Text>
                {joined && (
                  <Text fontSize="9px" fontWeight="600" whiteSpace="nowrap">
                    ✓
                  </Text>
                )}
              </HStack>
              <Text fontSize="10px" opacity={0.85}>
                {t.arenaTimeControl} {t.isRated ? "Rated" : "Casual"}
              </Text>
              <Text fontSize="10px" fontWeight="600">
                {t.currentPlayers} / {t.maxPlayers}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Flex>
  );
}

export function TournamentListMobile({
  tournaments,
  currentUserId,
}: {
  tournaments: ScheduleTournament[];
  currentUserId?: string;
}) {
  return (
    <VStack align="stretch" gap={3}>
      {tournaments.map((t) => {
        const joined = currentUserId ? t.participants.some((p) => p.user.id === currentUserId) : false;
        return (
          <Box
            key={t.id}
            p={4}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <Text fontWeight="700" color="gold">
              {t.name}
            </Text>
            <Text fontSize="sm" color="textSecondary">
              {new Date(t.startDate).toLocaleString()} · {t.arenaTimeControl} · {t.chessVariant}
            </Text>
            <Text fontSize="xs" color="textMuted">
              {t.currentPlayers}/{t.maxPlayers} players {joined ? "· You joined" : ""}
            </Text>
          </Box>
        );
      })}
    </VStack>
  );
}
