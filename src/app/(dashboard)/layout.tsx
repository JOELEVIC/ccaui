"use client";

import { useState } from "react";
import { Box, Flex, VStack } from "@chakra-ui/react";
import { Sidebar } from "@/components/common/Sidebar";
import { TopBar } from "@/components/common/TopBar";
import { PageTransition } from "@/components/common/PageTransition";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { BlendedBackground } from "@/components/common/BlendedBackground";
import { ubcaImages } from "@/assets/images/ubca";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <BlendedBackground
        src={ubcaImages.boardTop}
        imageOpacity={0.28}
        blendMode="multiply"
      >
        <Flex minH="100%" bg="transparent">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <VStack flex={1} align="stretch" minW={0} minWidth={0}>
            <TopBar onMenuPress={() => setSidebarOpen(true)} />
            <Box flex={1} p={{ base: 3, md: 6 }} overflow="auto" w="full">
              <PageTransition>{children}</PageTransition>
            </Box>
          </VStack>
        </Flex>
      </BlendedBackground>
    </ProtectedRoute>
  );
}
