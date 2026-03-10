"use client";

import { Box, Button, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import Link from "next/link";

export interface TournamentItem {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  school: { id: string; name: string; region: string };
  participants: Array<{ user: { id: string; username: string; rating: number } }>;
}

function StatusBadge({ status }: { status: string }) {
  const isLive = status === "ONGOING";
  return (
    <HStack gap={2}>
      {isLive && (
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg="gold"
          style={{ animation: "pulse 1.5s ease-in-out infinite" }}
        />
      )}
      <Text color="textSecondary" fontSize="xs" fontWeight="600" textTransform="uppercase">
        {status === "ONGOING" ? "Live" : status === "UPCOMING" ? "Upcoming" : "Completed"}
      </Text>
    </HStack>
  );
}

export function TournamentGrid({
  list,
  upcoming,
  currentUserId,
  onJoin,
  joining,
  tournamentsBasePath = "/tournaments",
}: {
  list: TournamentItem[];
  upcoming?: boolean;
  currentUserId?: string;
  onJoin?: (id: string) => void;
  joining?: boolean;
  tournamentsBasePath?: string;
}) {
  if (list.length === 0) {
    return <Text color="textMuted">No tournaments in this category.</Text>;
  }
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
      {list.map((t) => {
        const isParticipant = currentUserId && t.participants?.some((p) => p.user?.id === currentUserId);
        const initial = t.school.name?.charAt(0)?.toUpperCase() ?? "?";
        const detailHref = `${tournamentsBasePath}/${t.id}`;
        return (
          <Box
            key={t.id}
            p={5}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
            boxShadow="var(--shadow-card-soft)"
            _hover={{ borderColor: "gold", boxShadow: "var(--shadow-card-soft-hover)" }}
            transition="all 0.2s"
            display="flex"
            flexDir="column"
            gap={3}
          >
            <HStack justify="space-between" align="flex-start">
              <Box
                w="40px"
                h="40px"
                borderRadius="soft"
                bg="goldDark"
                color="gold"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="sm"
              >
                {initial}
              </Box>
              <StatusBadge status={t.status} />
            </HStack>
            <Link href={detailHref}>
              <Text color="gold" fontWeight="bold" fontSize="lg" _hover={{ textDecoration: "underline" }}>
                {t.name}
              </Text>
              <Text color="textSecondary" fontSize="sm" mt={1}>
                {t.school.name} · {t.participants.length} participants
              </Text>
              <Text color="textMuted" fontSize="xs" mt={1}>
                {new Date(t.startDate).toLocaleDateString()}
              </Text>
            </Link>
            {upcoming && currentUserId && !isParticipant && onJoin && (
              <Button
                size="sm"
                variant="outline"
                color="gold"
                borderColor="gold"
                borderRadius="soft"
                alignSelf="flex-start"
                loading={joining}
                onClick={(e) => {
                  e.preventDefault();
                  onJoin(t.id);
                }}
              >
                Register
              </Button>
            )}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
