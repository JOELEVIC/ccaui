"use client";

import Link from "next/link";
import { Box, Button, Container, Flex, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

/**
 * Landing teaser for the public "Board Memory" trainer. Shows a tiny animated
 * "flash → recall" illustration and links to the no-login game.
 */
export function LandingMemory() {
  return (
    <Box py={{ base: 14, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <Flex direction={{ base: "column", lg: "row" }} align="center" gap={{ base: 10, lg: 16 }}>
          <VStack align={{ base: "center", lg: "flex-start" }} gap={4} flex={1} textAlign={{ base: "center", lg: "left" }}>
            <Text fontSize="xs" color="gold" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase">
              New · Visualisation
            </Text>
            <Heading size={{ base: "lg", md: "xl" }} fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary" fontWeight="600" lineHeight="1.1">
              Train the skill grandmasters rely on
            </Heading>
            <Text color="textSecondary" fontSize={{ base: "sm", md: "md" }} maxW="lg" lineHeight="1.65">
              <strong style={{ color: "var(--gold)" }}>Board Memory</strong> flashes a position for a
              few seconds, then asks you to rebuild it. It&apos;s the visualisation muscle behind
              every calculation — and it&apos;s oddly addictive. No sign-up to try.
            </Text>
            <Link href="/train">
              <Button bg="gold" color="white" size="lg" px={8} borderRadius="soft" fontWeight="600" _hover={{ bg: "goldLight", boxShadow: "0 0 28px rgba(197,160,89,0.4)" }} _active={{ transform: "scale(0.97)" }} transition="all 0.15s">
                Try Board Memory →
              </Button>
            </Link>
          </VStack>

          {/* Mini 4×4 flash illustration */}
          <Box flex={1} maxW="360px" w="full">
            <SimpleGrid columns={4} gap={1.5}>
              {Array.from({ length: 16 }).map((_, i) => {
                const lit = [1, 6, 9, 12, 3].includes(i);
                const dark = (Math.floor(i / 4) + i) % 2 === 1;
                return (
                  <MotionBox
                    key={i}
                    style={{ aspectRatio: "1 / 1" }}
                    borderRadius="md"
                    bg={dark ? "#9ca3af" : "#e5e7eb"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    animate={lit ? { opacity: [1, 1, 0.25, 0.25, 1] } : { opacity: 1 }}
                    transition={lit ? { duration: 3.2, repeat: Infinity, times: [0, 0.35, 0.5, 0.85, 1], ease: "easeInOut" } : {}}
                  >
                    {lit && (
                      <Text fontSize={{ base: "lg", md: "2xl" }} lineHeight="1" color="#1A2530">
                        {["♞", "♝", "♜", "♛", "♟"][[1, 6, 9, 12, 3].indexOf(i)]}
                      </Text>
                    )}
                  </MotionBox>
                );
              })}
            </SimpleGrid>
            <Text textAlign="center" color="textMuted" fontSize="2xs" mt={3} letterSpacing="0.06em">
              Watch · memorise · rebuild
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
