"use client";

import { useState } from "react";
import { Box, Container, Heading, Text, VStack, Flex, Button } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { players2 } from "@/assets/images/ubca";
import { fadeInUp, defaultViewport } from "@/lib/animations";

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
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              style={{ width: "100%" }}
            >
              <Text
                color="gold"
                fontSize="xs"
                fontWeight="600"
                letterSpacing="0.08em"
                textTransform="uppercase"
                fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                mb={2}
              >
                Discover our story here
              </Text>
              <Heading
                size="xl"
                fontFamily="var(--font-playfair), Georgia, serif"
                color="textPrimary"
                letterSpacing="0.03em"
              >
                Join the CCA family now
              </Heading>
              <Box h="1px" w="48px" bg="gold" opacity={0.8} my={4} mx={{ base: "auto", lg: 0 }} />
              <Text color="textSecondary" fontSize="md" lineHeight="1.75" maxW="lg">
                Started in Cameroon, CCA unites chess fans and gamers in a lively community. Our journey began as a simple chess club, growing into a dynamic home for lessons, play, and events.
              </Text>
              <Text color="textSecondary" fontSize="md" lineHeight="1.75" maxW="lg" mt={4}>
                CCA is a home for more than just chess. Play in tournaments, explore puzzles, and meet new friends. Our academy sparks joy and lasting bonds.
              </Text>
              <Link href="/register">
                <Button
                  size="md"
                  mt={6}
                  variant="outline"
                  borderColor="gold"
                  color="gold"
                  borderRadius="soft"
                  _hover={{ bg: "whiteAlpha.05" }}
                >
                  Become a member of the CCA family today!
                </Button>
              </Link>
            </motion.div>
          </VStack>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ flex: 1, width: "100%", maxWidth: "420px" }}
          >
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
              {!imageError ? (
                <Image
                  src={players2}
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
          </motion.div>
        </Flex>
      </Container>
    </Box>
  );
}
