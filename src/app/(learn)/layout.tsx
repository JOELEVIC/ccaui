"use client";

import { useState } from "react";
import { Box, Container, Flex } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppBottomNav } from "@/components/layout/AppBottomNav";
import { MoreDrawer } from "@/components/layout/MoreDrawer";
import { PageTransition } from "@/components/common/PageTransition";
import { OngoingGameRedirect } from "@/components/common/OngoingGameRedirect";
import { IncomingChallengePrompt } from "@/components/common/IncomingChallengePrompt";
import { LandingNav } from "@/components/home/LandingNav";
import { LandingFooter } from "@/components/home/LandingFooter";

/**
 * /learn is public: the Entry curriculum is fully client-side and progress
 * lives in localStorage, so a visitor can start learning without an account
 * (that's the beginner path the landing hero points at). Members get the
 * normal app chrome; guests get the landing chrome — no login wall.
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, token } = useAuth();

  if (user || token) {
    return (
      <>
        <OngoingGameRedirect />
        <IncomingChallengePrompt />
        <Flex minH="100vh" bg="var(--lux-obsidian)" color="var(--lux-text-primary)">
          <Flex flex={1} direction="column" minW={0} w="full">
            <AppHeader onOpenMore={() => setMoreOpen(true)} />
            <Box
              flex={1}
              p={{ base: 3, md: 8 }}
              pb={{ base: 20, md: 8 }}
              overflow="auto"
              w="full"
              bg="var(--lux-obsidian)"
            >
              <PageTransition>{children}</PageTransition>
            </Box>
            <AppBottomNav onMorePress={() => setMoreOpen(true)} />
          </Flex>
        </Flex>
        <MoreDrawer isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
      </>
    );
  }

  return (
    <Box minH="100vh" bg="bgDark" color="textPrimary" display="flex" flexDir="column">
      <LandingNav />
      <Box flex={1} py={{ base: 6, md: 10 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          {children}
        </Container>
      </Box>
      <LandingFooter />
    </Box>
  );
}
