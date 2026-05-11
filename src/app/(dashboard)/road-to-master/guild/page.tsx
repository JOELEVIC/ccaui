"use client";

import { Box } from "@chakra-ui/react";
import { GuildBoard } from "@/components/system/GuildBoard";

export default function GuildPage() {
  return (
    <Box bg="sys.void" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
      <Box maxW="1080px" mx="auto">
        <GuildBoard myGuildId="littoral" />
      </Box>
    </Box>
  );
}
