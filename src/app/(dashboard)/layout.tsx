"use client";

import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppBottomNav } from "@/components/layout/AppBottomNav";
import { MoreDrawer } from "@/components/layout/MoreDrawer";
import { PageTransition } from "@/components/common/PageTransition";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <ProtectedRoute>
      <Flex minH="100vh" bg="bgDark" color="textPrimary">
        <Flex flex={1} direction="column" minW={0} w="full">
          <AppHeader onOpenMore={() => setMoreOpen(true)} />
          <Box
            flex={1}
            p={{ base: 3, md: 6 }}
            pb={{ base: 20, md: 6 }}
            overflow="auto"
            w="full"
            bg="bgDark"
          >
            <PageTransition>{children}</PageTransition>
          </Box>
          <AppBottomNav onMorePress={() => setMoreOpen(true)} />
        </Flex>
      </Flex>
      <MoreDrawer isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
    </ProtectedRoute>
  );
}
