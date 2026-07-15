"use client";

import Link from "next/link";
import { Box, Text, HStack, Badge } from "@chakra-ui/react";
import type { ActivityListItem } from "@/graphql/activities";
import { activityTypeMeta, formatActivityDate } from "@/lib/community/activityHelpers";

function CoverImage({
  src,
  alt,
  h,
  photoCount,
}: {
  src: string | null;
  alt: string;
  h: string | object;
  photoCount?: number;
}) {
  return (
    <Box position="relative" w="full" h={h} overflow="hidden" bg="#EAE3D6">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <Box
          w="full"
          h="full"
          style={{ background: "linear-gradient(135deg, #1A2530 0%, #3a4a5a 100%)" }}
        />
      )}
      {photoCount && photoCount > 1 ? (
        <HStack
          position="absolute"
          bottom={2}
          right={2}
          zIndex={1}
          gap={1}
          px={2}
          py={1}
          borderRadius="full"
          bg="rgba(15,20,28,0.72)"
          backdropFilter="blur(4px)"
        >
          <Text fontSize="2xs" color="white" fontWeight="600" letterSpacing="0.04em">
            📷 {photoCount} photos
          </Text>
        </HStack>
      ) : null}
    </Box>
  );
}

function MetaRow({ activity }: { activity: ActivityListItem }) {
  const meta = activityTypeMeta(activity.type);
  return (
    <HStack gap={2} flexWrap="wrap">
      <Badge
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
      </Badge>
      {activity.region ? (
        <Text fontSize="xs" color="textMuted">
          {activity.region}
        </Text>
      ) : null}
      {activity.publishedAt ? (
        <Text fontSize="xs" color="textMuted">
          · {formatActivityDate(activity.publishedAt)}
        </Text>
      ) : null}
    </HStack>
  );
}

/** Large featured card — used for the hero of the feed / landing preview. */
export function ActivityFeatured({
  activity,
  basePath = "/community",
}: {
  activity: ActivityListItem;
  basePath?: string;
}) {
  return (
    <Link href={`${basePath}/${activity.slug}`}>
      <Box
        position="relative"
        borderRadius="soft"
        overflow="hidden"
        minH={{ base: "320px", md: "420px" }}
        boxShadow="var(--shadow-card-soft)"
        transition="all 0.25s"
        _hover={{ boxShadow: "var(--shadow-card-soft-hover)", transform: "translateY(-2px)" }}
      >
        <CoverImage
          src={activity.coverImageUrl}
          alt={activity.title}
          h={{ base: "320px", md: "420px" }}
          photoCount={activity.photoCount}
        />
        <Box
          position="absolute"
          inset={0}
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(15,20,28,0.88) 100%)" }}
        />
        <Box position="absolute" bottom={0} left={0} right={0} p={{ base: 5, md: 8 }}>
          <MetaRow activity={activity} />
          <Text
            mt={2}
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="600"
            color="white"
            lineHeight="1.15"
          >
            {activity.title}
          </Text>
          {activity.excerpt ? (
            <Text mt={2} fontSize={{ base: "sm", md: "md" }} color="rgba(255,255,255,0.85)" maxW="2xl">
              {activity.excerpt}
            </Text>
          ) : null}
        </Box>
      </Box>
    </Link>
  );
}

/** Standard card for the grid. */
export function ActivityCard({
  activity,
  basePath = "/community",
}: {
  activity: ActivityListItem;
  basePath?: string;
}) {
  return (
    <Link href={`${basePath}/${activity.slug}`}>
      <Box
        h="full"
        borderRadius="soft"
        overflow="hidden"
        bg="bgCard"
        borderWidth="1px"
        borderColor="goldDark"
        boxShadow="var(--shadow-card-soft)"
        transition="all 0.2s"
        _hover={{ borderColor: "gold", boxShadow: "var(--shadow-card-soft-hover)", transform: "translateY(-2px)" }}
      >
        <CoverImage src={activity.coverImageUrl} alt={activity.title} h="180px" photoCount={activity.photoCount} />
        <Box p={5}>
          <MetaRow activity={activity} />
          <Text
            mt={2}
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize="lg"
            fontWeight="600"
            color="textPrimary"
            lineHeight="1.25"
          >
            {activity.title}
          </Text>
          {activity.excerpt ? (
            <Text mt={2} fontSize="sm" color="textMuted" lineClamp={3}>
              {activity.excerpt}
            </Text>
          ) : null}
        </Box>
      </Box>
    </Link>
  );
}
