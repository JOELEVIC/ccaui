"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, SimpleGrid, HStack, Flex, Switch } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";
import { ActionCard } from "@/components/chess-pro/ActionCard";
import { PremiumModal } from "@/components/chess-pro/PremiumModal";
import { PLATFORM_METRICS } from "@/graphql/queries/chessPro";
import { APP_NAME } from "@/lib/appName";

const LIVE_GAMES = gql`
  query LiveGamesHome {
    liveGames {
      id
      white {
        username
      }
      black {
        username
      }
    }
  }
`;

export default function DashboardPage() {
  const { user } = useAuth();
  const [proOn, setProOn] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const { data: metricsData } = useQuery<{ platformMetrics: { playersTotal: number; playingNow: number } }>(
    PLATFORM_METRICS
  );
  const { data: gamesData } = useQuery<{ liveGames: { id: string }[] }>(LIVE_GAMES);

  const playersTotal = metricsData?.platformMetrics.playersTotal ?? 0;
  const playingNow = metricsData?.platformMetrics.playingNow ?? 0;
  const liveGames = gamesData?.liveGames ?? [];

  return (
    <VStack align="stretch" gap={8}>
      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="xl" fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary" fontWeight="600">
            Let&apos;s play Chess
          </Heading>
          <Text color="textMuted" fontSize="sm" mt={1}>
            {APP_NAME} · {user?.username ?? "Guest"}
          </Text>
        </Box>
        <HStack gap={3} align="center">
          <Text fontSize="sm" color="textSecondary">
            Pro
          </Text>
          <Switch.Root
            checked={proOn}
            onCheckedChange={(e) => {
              const on = e.checked;
              setProOn(on);
              if (on) setPremiumOpen(true);
            }}
          >
            <Switch.HiddenInput />
            <Switch.Control bg={proOn ? "gold" : "bgSurface"} borderWidth="1px" borderColor="whiteAlpha.200">
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        <ActionCard
          href="/games"
          title="Play with other users"
          description="Start with someone at your level."
          icon={<span>👥</span>}
        />
        <ActionCard
          href="/games"
          title="Play with friend via link"
          description="Send a link and start a battle."
          icon={<span>🔗</span>}
        />
        <ActionCard
          href="/play/bot"
          title="Play with computer"
          description="Practice with customizable bots."
          icon={<span>🤖</span>}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <Link href="/play/local">
          <Box
            p={4}
            borderRadius="soft"
            bg="bgSurface"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            textAlign="center"
            _hover={{ borderColor: "gold" }}
          >
            <Text fontWeight="600" color="textPrimary">
              Play offline with chess timer
            </Text>
          </Box>
        </Link>
        <Link href="/play/local">
          <Box
            p={4}
            borderRadius="soft"
            bg="bgSurface"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            textAlign="center"
            _hover={{ borderColor: "gold" }}
          >
            <Text fontWeight="600" color="textPrimary">
              Play with friend on one device
            </Text>
          </Box>
        </Link>
      </SimpleGrid>

      {liveGames.length > 0 && (
        <Box>
          <Text color="gold" fontWeight="600" mb={2}>
            Continue playing
          </Text>
          <VStack align="stretch" gap={2}>
            {liveGames.slice(0, 3).map((g) => (
              <Link key={g.id} href={`/game/${g.id}`}>
                <Box py={3} px={4} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.100">
                  Open game
                </Box>
              </Link>
            ))}
          </VStack>
        </Box>
      )}

      <HStack justify="space-between" flexWrap="wrap" gap={4} pt={4} borderTopWidth="1px" borderColor="whiteAlpha.100">
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
            Players total
          </Text>
          <Text fontSize="2xl" fontWeight="700" color="gold">
            {playersTotal.toLocaleString()}
          </Text>
        </VStack>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
            Playing now
          </Text>
          <Text fontSize="2xl" fontWeight="700" color="accentGreen">
            {playingNow.toLocaleString()}
          </Text>
        </VStack>
      </HStack>

      <PremiumModal open={premiumOpen} onClose={() => { setPremiumOpen(false); setProOn(false); }} />
    </VStack>
  );
}
