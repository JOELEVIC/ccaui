"use client";

import Link from "next/link";
import { Box, Container, Grid, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "@/lib/animations";
import { ACTIVITIES_FEED, type ActivityListItem } from "@/graphql/activities";
import { ActivityCard, ActivityFeatured } from "@/components/community/ActivityCard";
import { activityTypeMeta, formatActivityDate } from "@/lib/community/activityHelpers";

/**
 * Photo-forward hero for an event with a gallery: big cover on the left, a
 * 2×2 collage of curated highlights on the right, "+N more" on the last tile.
 * The whole mosaic is one link into the event page.
 */
function FeaturedEventCollage({ activity }: { activity: ActivityListItem }) {
  const meta = activityTypeMeta(activity.type);
  const tiles = activity.highlights.filter((img) => img.url !== activity.coverImageUrl).slice(0, 4);
  const morePhotos = Math.max(0, activity.photoCount - tiles.length - 1);

  return (
    <Link href={`/community/${activity.slug}`}>
      <Grid
        templateColumns={{ base: "1fr", md: "3fr 2fr" }}
        gap={2}
        borderRadius="soft"
        overflow="hidden"
        boxShadow="var(--shadow-card-soft)"
        transition="all 0.25s"
        _hover={{ boxShadow: "var(--shadow-card-soft-hover)", transform: "translateY(-2px)" }}
      >
        {/* Cover with title overlay */}
        <Box position="relative" minH={{ base: "300px", md: "440px" }} bg="#EAE3D6">
          {activity.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.coverImageUrl}
              alt={activity.title}
              loading="lazy"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : null}
          <Box
            position="absolute"
            inset={0}
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(15,20,28,0.88) 100%)" }}
          />
          <Box position="absolute" bottom={0} left={0} right={0} p={{ base: 5, md: 7 }}>
            <HStack gap={2} flexWrap="wrap">
              <Text
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="2xs"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color="white"
                style={{ background: meta.color }}
              >
                {meta.label}
              </Text>
              {activity.eventDate ? (
                <Text fontSize="xs" color="rgba(255,255,255,0.75)">
                  {formatActivityDate(activity.eventDate)}
                </Text>
              ) : null}
            </HStack>
            <Text
              mt={2}
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="600"
              color="white"
              lineHeight="1.15"
            >
              {activity.title}
            </Text>
            {activity.excerpt ? (
              <Text mt={1.5} fontSize="sm" color="rgba(255,255,255,0.85)" lineClamp={2} maxW="xl">
                {activity.excerpt}
              </Text>
            ) : null}
          </Box>
        </Box>

        {/* Highlight collage */}
        <Grid templateColumns="1fr 1fr" templateRows="1fr 1fr" gap={2} minH={{ base: "200px", md: "auto" }}>
          {tiles.map((img, i) => {
            const isLast = i === tiles.length - 1;
            return (
              <Box key={img.id} position="relative" overflow="hidden" bg="#EAE3D6" minH={{ base: "98px", md: "auto" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbUrl ?? img.url}
                  alt={activity.title}
                  loading="lazy"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {isLast && morePhotos > 0 ? (
                  <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="rgba(15,20,28,0.62)"
                  >
                    <Text color="white" fontWeight="700" fontSize={{ base: "sm", md: "lg" }}>
                      +{morePhotos} photos
                    </Text>
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Grid>
      </Grid>
    </Link>
  );
}

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
                  Moments from our events
                </Text>
              </VStack>
              <Link href="/community">
                <Text color="gold" fontWeight="600" fontSize="sm">
                  See all →
                </Text>
              </Link>
            </HStack>

            {featured.highlights.filter((img) => img.url !== featured.coverImageUrl).length >= 4 ? (
              <FeaturedEventCollage activity={featured} />
            ) : (
              <ActivityFeatured activity={featured} />
            )}

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
