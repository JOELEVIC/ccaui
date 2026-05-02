"use client";

import { Box, Heading, Text, VStack, HStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const RECENT = gql`
  query AnalysisRecentGames {
    myGames(status: COMPLETED) {
      id
      timeControl
      result
      white {
        username
      }
      black {
        username
      }
    }
  }
`;

type RecentGamesData = { myGames: { id: string; timeControl: string; result?: string | null; white: { username: string }; black: { username: string } }[] };

export default function AnalysisHubPage() {
  const { data } = useQuery<RecentGamesData>(RECENT);
  const games = data?.myGames ?? [];

  return (
    <VStack align="stretch" gap={8}>
      <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
        <Box>
          <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary">
            Analysis
          </Heading>
          <Text color="textSecondary" maxW="lg" mt={1}>
            Review finished games with evaluation and accuracy stats. Open a completed game from the list below.
          </Text>
        </Box>
        <Link href="/analysis/import">
          <Button size="sm" bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
            Import from Chess.com
          </Button>
        </Link>
      </HStack>
      <VStack align="stretch" gap={2}>
        {games.length === 0 && <Text color="textMuted">No completed games yet.</Text>}
        {games.slice(0, 15).map((g: { id: string; timeControl: string; white: { username: string }; black: { username: string } }) => (
          <Link key={g.id} href={`/game/${g.id}`}>
            <Box
              py={3}
              px={4}
              borderRadius="soft"
              bg="bgCard"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              _hover={{ borderColor: "gold" }}
            >
              <Text fontWeight="600" color="gold">
                {g.white.username} vs {g.black.username}
              </Text>
              <Text fontSize="sm" color="textMuted">
                {g.timeControl}
              </Text>
            </Box>
          </Link>
        ))}
      </VStack>
      <Link href="/games">
        <Button variant="outline" borderColor="gold" color="gold" borderRadius="soft">
          All games
        </Button>
      </Link>
    </VStack>
  );
}
