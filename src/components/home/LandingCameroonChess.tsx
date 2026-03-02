"use client";

import { useState } from "react";
import { Box, Container, Heading, Text, VStack, Flex } from "@chakra-ui/react";
import Image from "next/image";

export function LandingCameroonChess() {
  const [imageError, setImageError] = useState(false);

  return (
    <Box py={{ base: 16, md: 24 }} bg="bgCard">
      <Container maxW="6xl">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          gap={{ base: 8, lg: 12 }}
        >
          <VStack align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} gap={4} flex={1}>
            <Heading
              size="lg"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="textPrimary"
              letterSpacing="0.03em"
            >
              Cameroon &amp; Chess
            </Heading>
            <Box h="1px" w="48px" bg="gold" opacity={0.8} />
            <Text color="textSecondary" fontSize="md" lineHeight="1.75" maxW="lg">
              Chess in Cameroon is growing through youth programmes, university leagues, and the work of the national federation. 
              The Cameroon Chess Academy brings together players, coaches, and institutions on one platform—so that every mind with a passion for the game can compete, learn, and represent.
            </Text>
          </VStack>
          <Box
            flex={1}
            position="relative"
            w="full"
            maxW={{ lg: "420px" }}
            aspectRatio="4/3"
            borderRadius="var(--radius-soft)"
            overflow="hidden"
            bg="bgSurface"
            borderWidth="1px"
            borderColor="goldDark"
            boxShadow="var(--shadow-card-soft)"
          >
            {!imageError ? (
              <Image
                src="/images/cameroon-chess.jpg"
                alt="Chess in Cameroon"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                style={{ objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
            ) : (
              <Box
                position="absolute"
                inset={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="textMuted"
                fontSize="sm"
                background="linear-gradient(145deg, #1a1e26 0%, #15181f 100%)"
              >
                Chess in Cameroon
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
