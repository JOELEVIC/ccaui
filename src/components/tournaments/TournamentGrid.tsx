"use client";

import { Box, Button, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import Link from "next/link";

export interface TournamentItem {
  id: string;
  name: string;
  status: string;
  format?: string;
  startDate: string;
  endDate?: string | null;
  school: { id: string; name: string; region: string };
  participants: Array<{ user: { id: string; username: string; rating: number } }>;
}

const FORMAT_LABEL: Record<string, string> = {
  ARENA: "Arena",
  SWISS: "Swiss",
  ROUND_ROBIN: "Round robin",
  KNOCKOUT: "Knockout",
};

function StatusBadge({ status, onDark }: { status: string; onDark?: boolean }) {
  const isLive = status === "ONGOING";
  const label = isLive ? "Live" : status === "UPCOMING" ? "Upcoming" : "Done";
  return (
    <HStack gap={1.5}>
      {isLive && (
        <Box w="7px" h="7px" borderRadius="full" bg="#3DBA6E" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
      )}
      <Text
        fontSize="2xs"
        fontWeight="700"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color={onDark ? "whiteAlpha.800" : "textSecondary"}
      >
        {label}
      </Text>
    </HStack>
  );
}

const pulse = { animation: "pulse 1.5s ease-in-out infinite" } as const;

function SkeletonCard() {
  return (
    <Box borderRadius="soft" overflow="hidden" bg="bgCard" borderWidth="1px" borderColor="goldDark">
      <Box h="56px" bg="blackAlpha.100" style={pulse} />
      <Box p={4}>
        <Box h="14px" w="70%" borderRadius="full" bg="blackAlpha.100" style={pulse} />
        <Box h="10px" w="45%" mt={3} borderRadius="full" bg="blackAlpha.50" style={pulse} />
      </Box>
    </Box>
  );
}

export function TournamentGrid({
  list,
  upcoming,
  currentUserId,
  onJoin,
  joining,
  loading,
  tournamentsBasePath = "/tournaments",
}: {
  list: TournamentItem[];
  upcoming?: boolean;
  currentUserId?: string;
  onJoin?: (id: string) => void;
  joining?: boolean;
  loading?: boolean;
  tournamentsBasePath?: string;
}) {
  // Skeletons while the first load is in flight — never the misleading "none" message.
  if (loading && list.length === 0) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </SimpleGrid>
    );
  }

  if (list.length === 0) {
    return (
      <Box py={12} textAlign="center" borderRadius="soft" borderWidth="1px" borderColor="goldDark" bg="bgCard">
        <Text color="textMuted">No tournaments here yet — check back soon.</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
      {list.map((t) => {
        const isParticipant = currentUserId && t.participants?.some((p) => p.user?.id === currentUserId);
        const initial = t.school?.name?.charAt(0)?.toUpperCase() ?? "♟";
        const detailHref = `${tournamentsBasePath}/${t.id}`;
        const fmt = t.format ? FORMAT_LABEL[t.format] ?? t.format : null;
        return (
          <Box
            key={t.id}
            borderRadius="soft"
            overflow="hidden"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
            boxShadow="var(--shadow-card-soft)"
            _hover={{ borderColor: "gold", boxShadow: "var(--shadow-card-soft-hover)", transform: "translateY(-2px)" }}
            transition="all 0.2s"
            display="flex"
            flexDir="column"
          >
            {/* Visual banner — leans on colour + a chess motif instead of text. */}
            <HStack
              h="56px"
              px={4}
              justify="space-between"
              align="center"
              position="relative"
              overflow="hidden"
              style={{ background: "linear-gradient(135deg, #1A2530 0%, #3a4a5a 100%)" }}
            >
              <Text position="absolute" right="-6px" bottom="-14px" fontSize="64px" lineHeight="1" color="whiteAlpha.100">
                ♞
              </Text>
              <Box
                w="36px"
                h="36px"
                borderRadius="soft"
                bg="rgba(197,160,89,0.2)"
                borderWidth="1px"
                borderColor="gold"
                color="gold"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="sm"
              >
                {initial}
              </Box>
              <StatusBadge status={t.status} onDark />
            </HStack>

            <Link href={detailHref}>
              <Box p={4} _hover={{ "& .t-name": { color: "gold" } }}>
                <Text className="t-name" color="textPrimary" fontWeight="700" fontSize="md" lineClamp={2} transition="color 0.2s">
                  {t.name}
                </Text>
                <HStack gap={2} mt={1.5} flexWrap="wrap">
                  {fmt ? (
                    <Text fontSize="xs" color="gold" fontWeight="600">
                      {fmt}
                    </Text>
                  ) : null}
                  <Text fontSize="xs" color="textMuted">
                    {fmt ? "· " : ""}
                    {t.participants.length} {t.participants.length === 1 ? "player" : "players"}
                  </Text>
                  <Text fontSize="xs" color="textMuted">
                    · {new Date(t.startDate).toLocaleDateString()}
                  </Text>
                </HStack>
              </Box>
            </Link>

            {upcoming && currentUserId && !isParticipant && onJoin && (
              <Box px={4} pb={4}>
                <Button
                  size="sm"
                  bg="gold"
                  color="black"
                  borderRadius="soft"
                  _hover={{ bg: "goldLight" }}
                  alignSelf="flex-start"
                  loading={joining}
                  onClick={(e) => {
                    e.preventDefault();
                    onJoin(t.id);
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
