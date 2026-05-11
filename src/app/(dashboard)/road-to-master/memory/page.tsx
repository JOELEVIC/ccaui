"use client";

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { MemoryEcho } from "@/components/system/MemoryEcho";

export default function MemoryEchoPage() {
  const [lastScore, setLastScore] = useState<number | null>(null);
  return (
    <Box bg="sys.void" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
      <Box maxW="980px" mx="auto">
        <MemoryEcho onComplete={(s) => setLastScore(s)} />
        {lastScore !== null && (
          <Box mt={3} color="textMuted" fontSize="sm">
            Last echo: {lastScore}% — required &gt; 70% to unlock Red Gates.
          </Box>
        )}
      </Box>
    </Box>
  );
}
