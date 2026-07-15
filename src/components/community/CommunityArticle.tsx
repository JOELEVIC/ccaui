"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { AspectRatio, Box, Container, HStack, Text, VStack, Badge } from "@chakra-ui/react";
import { ACTIVITY_BY_SLUG, type ActivityDetail } from "@/graphql/activities";
import {
  activityTypeMeta,
  formatActivityDate,
  parseBody,
  renderTiptap,
  toEmbedUrl,
} from "@/lib/community/activityHelpers";
import { ShareBar } from "@/components/community/ShareBar";
import { Lightbox } from "@/components/community/Lightbox";

/**
 * The community article body — shared by the public and dashboard detail routes.
 * `basePath` keeps the back-link inside the current shell.
 */
export function CommunityArticle({
  slug,
  basePath = "/community",
  embedded = false,
}: {
  slug: string;
  basePath?: string;
  embedded?: boolean;
}) {
  const { data, loading, error } = useQuery<{ activity: ActivityDetail | null }>(ACTIVITY_BY_SLUG, {
    variables: { slug },
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const a = data?.activity;

  if (loading) {
    return (
      <Box bg="bgPrimary" minH={embedded ? "60vh" : "100vh"} py={20} textAlign="center" color="textMuted">
        Loading…
      </Box>
    );
  }
  if (error || !a) {
    return (
      <Box bg="bgPrimary" minH={embedded ? "60vh" : "100vh"} py={20} textAlign="center">
        <VStack gap={4}>
          <Text color="textMuted">This post isn&apos;t available.</Text>
          <Link href={basePath}>
            <Text color="gold" fontWeight="600">
              ← Back to community
            </Text>
          </Link>
        </VStack>
      </Box>
    );
  }

  const meta = activityTypeMeta(a.type);
  const embed = toEmbedUrl(a.videoEmbedUrl);

  return (
    <Box
      bg="bgPrimary"
      minH={embedded ? "auto" : "100vh"}
      borderRadius={embedded ? "16px" : "0"}
      overflow="hidden"
      pb={{ base: 12, md: 20 }}
    >
      {/* Cover */}
      {a.coverImageUrl ? (
        <Box position="relative" w="full" h={{ base: "240px", md: "420px" }} overflow="hidden" bg="#EAE3D6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.coverImageUrl}
            alt={a.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <Box
            position="absolute"
            inset={0}
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(15,20,28,0.55) 100%)" }}
          />
        </Box>
      ) : null}

      <Container maxW="3xl" mt={a.coverImageUrl ? { base: -10, md: -16 } : 8} position="relative">
        <Box bg="bgCard" borderRadius="soft" boxShadow="var(--shadow-card-soft)" p={{ base: 6, md: 10 }}>
          <Link href={basePath}>
            <Text fontSize="sm" color="gold" fontWeight="600" mb={4}>
              ← Community
            </Text>
          </Link>

          <HStack gap={2} flexWrap="wrap" mb={3}>
            <Badge
              px={2.5}
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
            {a.region ? (
              <Text fontSize="xs" color="textMuted">
                {a.region}
              </Text>
            ) : null}
            {a.publishedAt ? (
              <Text fontSize="xs" color="textMuted">
                · {formatActivityDate(a.publishedAt)}
              </Text>
            ) : null}
          </HStack>

          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="600"
            color="textPrimary"
            lineHeight="1.15"
          >
            {a.title}
          </Text>
          {a.excerpt ? (
            <Text mt={3} fontSize="lg" color="textSecondary">
              {a.excerpt}
            </Text>
          ) : null}

          <Box mt={5} pt={5} borderTopWidth="1px" borderColor="goldDark">
            <ShareBar slug={a.slug} title={a.title} />
          </Box>

          {embed ? (
            <AspectRatio ratio={16 / 9} mt={6} borderRadius="cca" overflow="hidden">
              <iframe src={embed} title={a.title} allowFullScreen style={{ border: 0 }} />
            </AspectRatio>
          ) : null}

          {/* Rendered Tiptap body */}
          <Box
            mt={6}
            color="textSecondary"
            css={{
              "& p": { margin: "0 0 1rem", lineHeight: 1.85 },
              "& h2": {
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#1A2530",
                margin: "2rem 0 0.75rem",
              },
              "& h3": { fontSize: "1.2rem", fontWeight: 600, color: "#1A2530", margin: "1.5rem 0 0.5rem" },
              "& ul, & ol": { paddingLeft: "1.3rem", margin: "0 0 1rem" },
              "& li": { marginBottom: "0.4rem", lineHeight: 1.75 },
              "& a": { color: "#C5A059", textDecoration: "underline" },
              "& strong": { fontWeight: 700, color: "#1A2530" },
              "& blockquote": {
                borderLeft: "3px solid #C5A059",
                paddingLeft: "1rem",
                fontStyle: "italic",
                color: "#5B6770",
                margin: "1.25rem 0",
              },
              "& img": { maxWidth: "100%", borderRadius: "8px", margin: "1rem 0" },
            }}
          >
            {renderTiptap(parseBody(a.bodyJson))}
          </Box>

          {a.tags.length ? (
            <HStack mt={8} gap={2} flexWrap="wrap">
              {a.tags.map((t) => (
                <Text key={t} fontSize="xs" color="textMuted" bg="bgPrimary" px={2.5} py={1} borderRadius="full">
                  #{t}
                </Text>
              ))}
            </HStack>
          ) : null}
        </Box>
      </Container>

      {/* Photo gallery — wider than the article card so the event breathes. */}
      {a.images.length ? (
        <Container maxW="5xl" mt={{ base: 10, md: 14 }}>
          <HStack justify="space-between" align="baseline" mb={5} flexWrap="wrap" gap={2}>
            <Text
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="600"
              color="textPrimary"
            >
              Moments
            </Text>
            <Text fontSize="sm" color="textMuted">
              {a.images.length} photo{a.images.length === 1 ? "" : "s"} · tap any to view
            </Text>
          </HStack>

          <Box
            css={{
              columnCount: 2,
              columnGap: "12px",
              "@media (min-width: 768px)": { columnCount: 3 },
            }}
          >
            {a.images.map((img, i) => (
              <Box
                key={img.id}
                as="button"
                display="block"
                w="full"
                mb="12px"
                borderRadius="cca"
                overflow="hidden"
                bg="#EAE3D6"
                cursor="zoom-in"
                style={{ breakInside: "avoid" }}
                transition="transform 0.2s, box-shadow 0.2s"
                _hover={{ transform: "scale(1.015)", boxShadow: "var(--shadow-card-soft-hover)" }}
                onClick={() => setLightboxIndex(i)}
                aria-label={img.caption ?? `Open photo ${i + 1} of ${a.images.length}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbUrl ?? img.url}
                  alt={img.caption ?? a.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: img.width && img.height ? `${img.width} / ${img.height}` : undefined,
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>

          <Lightbox
            images={a.images}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        </Container>
      ) : null}
    </Box>
  );
}
