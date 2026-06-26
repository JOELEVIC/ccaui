"use client";

import { useQuery } from "@apollo/client/react";
import { Box, Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ACTIVITIES_FEED, type ActivityListItem } from "@/graphql/activities";
import { ActivityCard, ActivityFeatured } from "@/components/community/ActivityCard";

/**
 * The community feed body — shared by the public `/community` page and the
 * logged-in `/dashboard/community` page. Owns a light surface so text contrast
 * is correct whether it sits on the public (light) shell or inside the dark
 * dashboard chrome. `basePath` keeps card/detail links inside the same shell.
 */
export function CommunityFeed({
  basePath = "/community",
  embedded = false,
}: {
  basePath?: string;
  embedded?: boolean;
}) {
  const { data, loading } = useQuery<{
    activities: { total: number; items: ActivityListItem[] };
  }>(ACTIVITIES_FEED, { variables: { limit: 24, offset: 0 } });

  const items = data?.activities.items ?? [];
  const featured = items.find((a) => a.featured) ?? items[0];
  const rest = items.filter((a) => a.id !== featured?.id);

  return (
    <Box
      bg="bgPrimary"
      minH={embedded ? "auto" : "100vh"}
      borderRadius={embedded ? "16px" : "0"}
      py={{ base: 10, md: 16 }}
    >
      <Container maxW="6xl">
        <VStack align="stretch" gap={{ base: 8, md: 12 }}>
          <VStack align="start" gap={2}>
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase" color="gold">
              Community
            </Text>
            <Text
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="600"
              color="textPrimary"
              lineHeight="1.1"
            >
              Events &amp; stories
            </Text>
            <Text color="textSecondary" maxW="2xl">
              Tournaments, recaps, photos and announcements from the chess community across Cameroon.
            </Text>
          </VStack>

          {loading && items.length === 0 ? (
            <Box py={20} textAlign="center" color="textMuted">
              Loading…
            </Box>
          ) : items.length === 0 ? (
            <Box
              py={16}
              textAlign="center"
              borderRadius="soft"
              borderWidth="1px"
              borderColor="goldDark"
              bg="bgCard"
            >
              <Text color="textMuted">Nothing here yet — check back soon for events and stories.</Text>
            </Box>
          ) : (
            <>
              {featured ? <ActivityFeatured activity={featured} basePath={basePath} /> : null}
              {rest.length ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
                  {rest.map((a) => (
                    <ActivityCard key={a.id} activity={a} basePath={basePath} />
                  ))}
                </SimpleGrid>
              ) : null}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
