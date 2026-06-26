"use client";

import Link from "next/link";
import { Box, Container, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "@/lib/animations";
import { ACTIVITIES_FEED, type ActivityListItem } from "@/graphql/activities";
import { ActivityCard, ActivityFeatured } from "@/components/community/ActivityCard";

export function LandingActivitiesPreview() {
  const { data } = useQuery<{ activities: { items: ActivityListItem[] } }>(ACTIVITIES_FEED, {
    variables: { limit: 4 },
  });
  const items = data?.activities.items ?? [];
  if (items.length === 0) return null; // hide the section until there's content

  const featured = items.find((a) => a.featured) ?? items[0];
  const rest = items.filter((a) => a.id !== featured.id).slice(0, 3);

  return (
    <Box py={{ base: 12, md: 24 }} bg="bgPrimary">
      <Container maxW="6xl">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
          <VStack align="stretch" gap={{ base: 6, md: 10 }}>
            <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={4}>
              <VStack align="start" gap={1}>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  letterSpacing="0.22em"
                  textTransform="uppercase"
                  color="gold"
                >
                  From the community
                </Text>
                <Text
                  fontFamily="var(--font-playfair), Georgia, serif"
                  fontSize={{ base: "2xl", md: "4xl" }}
                  fontWeight="600"
                  color="textPrimary"
                  lineHeight="1.1"
                >
                  Events &amp; stories
                </Text>
              </VStack>
              <Link href="/community">
                <Text color="gold" fontWeight="600" fontSize="sm">
                  See all →
                </Text>
              </Link>
            </HStack>

            <ActivityFeatured activity={featured} />

            {rest.length ? (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
                {rest.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </SimpleGrid>
            ) : null}
          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}
