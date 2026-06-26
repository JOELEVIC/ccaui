"use client";

import { useQuery } from "@apollo/client/react";
import { Box, Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ACTIVITIES_FEED, type ActivityListItem } from "@/graphql/activities";
import { ActivityCard, ActivityFeatured } from "@/components/community/ActivityCard";

export default function CommunityPage() {
  const { data, loading } = useQuery<{
    activities: { total: number; items: ActivityListItem[] };
  }>(ACTIVITIES_FEED, { variables: { limit: 24, offset: 0 } });

  const items = data?.activities.items ?? [];
  const featured = items.find((a) => a.featured) ?? items[0];
  const rest = items.filter((a) => a.id !== featured?.id);

  return (
    <Box bg="bgPrimary" minH="100vh" py={{ base: 10, md: 16 }}>
      <Container maxW="6xl">
        <VStack align="stretch" gap={{ base: 8, md: 12 }}>
          <VStack align="start" gap={2}>
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.22em"
              textTransform="uppercase"
              color="gold"
            >
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
              {featured ? <ActivityFeatured activity={featured} /> : null}
              {rest.length ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
                  {rest.map((a) => (
                    <ActivityCard key={a.id} activity={a} />
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
