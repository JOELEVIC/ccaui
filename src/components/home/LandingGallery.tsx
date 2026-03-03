"use client";

import { useState } from "react";
import { Box, Container, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { hero1, players2, boardTop, handsBoard } from "@/assets/images/ubca";

const GALLERY_ITEMS = [
  { src: hero1, alt: "Chess at the academy" },
  { src: players2, alt: "Players at the board" },
  { src: boardTop, alt: "Board and pieces" },
  { src: handsBoard, alt: "Game in progress" },
];

function GalleryTile({ src, alt }: { src: (typeof GALLERY_ITEMS)[number]["src"]; alt: string }) {
  const [error, setError] = useState(false);

  return (
    <Box
      position="relative"
      aspectRatio="4/3"
      borderRadius="var(--radius-soft)"
      overflow="hidden"
      bg="bgSurface"
      borderWidth="1px"
      borderColor="goldDark"
      boxShadow="var(--shadow-card-soft)"
    >
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
          onError={() => setError(true)}
        />
      ) : (
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="textMuted"
          fontSize="xs"
          background="linear-gradient(145deg, #1a1e26 0%, #15181f 100%)"
        >
          {alt}
        </Box>
      )}
    </Box>
  );
}

export function LandingGallery() {
  return (
    <Box py={{ base: 12, md: 16 }} bg="bgDark">
      <Container maxW="6xl">
        <VStack gap={8} align="stretch">
          <VStack gap={2}>
            <Heading
              size="lg"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="textPrimary"
              letterSpacing="0.03em"
              textTransform="uppercase"
              textAlign="center"
            >
              Moments
            </Heading>
            <Box h="1px" w="48px" bg="gold" opacity={0.8} />
          </VStack>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
            {GALLERY_ITEMS.map((item, i) => (
              <GalleryTile key={i} src={item.src} alt={item.alt} />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
