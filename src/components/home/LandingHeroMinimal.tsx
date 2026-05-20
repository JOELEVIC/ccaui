"use client";

import { useState } from "react";
import { Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { ShowcaseBoard } from "./ShowcaseBoard";
import { staggerContainer, staggerChild } from "@/lib/animations";

const STATS = [
  { value: "S-Rank", label: "Roadmap to master" },
  { value: "Live", label: "Engine review · 0 server cost" },
  { value: "CM", label: "Cameroon · founding chapter" },
];

export function LandingHeroMinimal() {
  const { user } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const handlePlay = () => {
    if (user) router.push("/games");
    else setShowLogin(true);
  };

  return (
    <>
      <Box
        position="relative"
        minH={{ base: "auto", md: "100vh" }}
        py={{ base: 16, md: 0 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="bgDark"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset={0}
          background="radial-gradient(ellipse 80% 50% at 50% 30%, rgba(230,164,82,0.08) 0%, transparent 65%)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          inset={0}
          opacity={0.04}
          backgroundImage="linear-gradient(rgba(230,164,82,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(230,164,82,0.4) 1px, transparent 1px)"
          backgroundSize="48px 48px"
          pointerEvents="none"
        />

        <Container maxW="6xl" position="relative" zIndex={1}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            gap={{ base: 12, lg: 16 }}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ flex: 1, width: "100%" }}
            >
              <VStack
                align={{ base: "center", lg: "flex-start" }}
                textAlign={{ base: "center", lg: "left" }}
                gap={6}
              >
                <motion.div variants={staggerChild}>
                  <HStack
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    bg="rgba(230,164,82,0.08)"
                    borderWidth="1px"
                    borderColor="goldDark"
                    gap={2}
                  >
                    <Box w="6px" h="6px" borderRadius="full" bg="cameroonGreen" />
                    <Box w="6px" h="6px" borderRadius="full" bg="cameroonRed" />
                    <Box w="6px" h="6px" borderRadius="full" bg="cameroonYellow" />
                    <Text
                      ml={1}
                      fontSize="xs"
                      color="gold"
                      fontWeight="600"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                    >
                      Cameroon Chess Academy
                    </Text>
                  </HStack>
                </motion.div>
                <motion.div variants={staggerChild}>
                  <Heading
                    as="h1"
                    size={{ base: "2xl", md: "4xl" }}
                    fontFamily="var(--font-playfair), Georgia, serif"
                    color="textPrimary"
                    fontWeight="600"
                    letterSpacing="0.01em"
                    lineHeight="1.05"
                  >
                    Train. Compete.{" "}
                    <Box as="span" color="gold">
                      Climb.
                    </Box>
                  </Heading>
                </motion.div>
                <motion.div variants={staggerChild}>
                  <Text color="textSecondary" fontSize={{ base: "md", md: "lg" }} lineHeight="1.65" maxW="xl">
                    A complete chess platform for Cameroon — live games, arena tournaments, daily puzzles,
                    and an in-browser engine that reviews every move. Climb from <strong style={{ color: "var(--chakra-colors-gold)" }}>E-Rank to SS</strong> on the
                    Road to Master.
                  </Text>
                </motion.div>

                <motion.div variants={staggerChild}>
                  <HStack gap={3} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                    <Button
                      size="lg"
                      onClick={handlePlay}
                      bg="gold"
                      color="bgDark"
                      px={8}
                      borderRadius="soft"
                      fontWeight="600"
                      _hover={{ bg: "goldLight", boxShadow: "0 0 28px rgba(230,164,82,0.4)" }}
                      transition="all 0.2s"
                    >
                      ▶ Play now
                    </Button>
                    <Link href="/road-to-master">
                      <Button
                        size="lg"
                        variant="outline"
                        borderColor="whiteAlpha.300"
                        color="textPrimary"
                        borderRadius="soft"
                        _hover={{ borderColor: "gold", color: "gold" }}
                      >
                        Road to Master
                      </Button>
                    </Link>
                    <Link href="/tournaments">
                      <Button
                        size="lg"
                        variant="ghost"
                        color="textSecondary"
                        borderRadius="soft"
                        _hover={{ color: "gold" }}
                      >
                        See tournaments →
                      </Button>
                    </Link>
                  </HStack>
                </motion.div>

                <motion.div variants={staggerChild} style={{ width: "100%" }}>
                  <SimpleGrid
                    columns={3}
                    gap={{ base: 3, md: 6 }}
                    pt={4}
                    w="full"
                    maxW={{ base: "full", lg: "md" }}
                  >
                    {STATS.map((s) => (
                      <VStack key={s.label} align={{ base: "center", lg: "flex-start" }} gap={0.5}>
                        <Text
                          fontSize={{ base: "md", md: "xl" }}
                          fontWeight="700"
                          color="gold"
                          fontFamily="var(--font-playfair), Georgia, serif"
                          lineHeight="1.1"
                        >
                          {s.value}
                        </Text>
                        <Text
                          fontSize={{ base: "2xs", md: "xs" }}
                          color="textSecondary"
                          letterSpacing="wider"
                          textAlign={{ base: "center", lg: "left" }}
                          lineHeight="1.3"
                        >
                          {s.label}
                        </Text>
                      </VStack>
                    ))}
                  </SimpleGrid>
                </motion.div>
              </VStack>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, width: "100%", maxWidth: 480 }}
            >
              <ShowcaseBoard size="100%" />
            </motion.div>
          </Flex>
        </Container>
      </Box>
      <LoginPanel open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
