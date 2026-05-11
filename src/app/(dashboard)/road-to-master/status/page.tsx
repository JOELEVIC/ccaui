"use client";

import { Box } from "@chakra-ui/react";
import { StatusWindow } from "@/components/system/StatusWindow";
import { useAuth } from "@/lib/auth";

export default function StatusPage() {
  const { user } = useAuth();
  const username = user?.username ?? "Hunter";
  const rating = user?.rating ?? 1200;
  return (
    <Box bg="sys.void" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
      <Box maxW="1080px" mx="auto">
        <StatusWindow username={username} rating={rating} />
      </Box>
    </Box>
  );
}
