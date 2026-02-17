"use client";

import { Box, Flex, VStack } from "@chakra-ui/react";
import { Sidebar } from "@/components/common/Sidebar";
import { TopBar } from "@/components/common/TopBar";
import { PageTransition } from "@/components/common/PageTransition";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Flex minH="100vh" bg="bgDark">
        <Sidebar />
        <VStack flex={1} align="stretch" minW={0}>
          <TopBar />
          <Box flex={1} p={6} overflow="auto" w="full">
            <PageTransition>{children}</PageTransition>
          </Box>
        </VStack>
      </Flex>
    </ProtectedRoute>
  );
}
