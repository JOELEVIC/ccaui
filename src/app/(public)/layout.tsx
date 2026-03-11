"use client";

import { Box, Container } from "@chakra-ui/react";
import { LandingNav } from "@/components/home/LandingNav";
import { LandingFooter } from "@/components/home/LandingFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" bg="bgDark" color="white" display="flex" flexDir="column">
      <LandingNav />
      <Box flex={1} py={{ base: 8, md: 12 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          {children}
        </Container>
      </Box>
      <LandingFooter />
    </Box>
  );
}
