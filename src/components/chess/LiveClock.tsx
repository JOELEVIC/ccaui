"use client";

import { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";

function format(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSec = clamped / 1000;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  // Under 20s, show tenths for that last-second tension.
  if (m === 0 && totalSec < 20) {
    const tenths = Math.floor((totalSec * 10) % 10);
    return `${s}.${tenths}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * A chess clock that counts down smoothly between server updates.
 * `ms` is the anchored remaining time and `anchorAt` is the *client* timestamp
 * (Date.now()) when it was received — anchoring on the client side keeps the
 * countdown free of client/server clock skew.
 */
export function LiveClock({
  ms,
  anchorAt,
  running,
}: {
  ms: number;
  anchorAt: number;
  running: boolean;
}) {
  const [display, setDisplay] = useState(ms);

  useEffect(() => {
    if (!running) {
      setDisplay(ms);
      return;
    }
    const tick = () => setDisplay(Math.max(0, ms - (Date.now() - anchorAt)));
    tick();
    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [ms, anchorAt, running]);

  const low = display <= 20000;
  const critical = display <= 10000;

  return (
    <Box
      px={3}
      py={1}
      borderRadius="soft"
      minW="78px"
      textAlign="center"
      bg={running ? "bgSurface" : "bgDark"}
      borderWidth="1px"
      borderColor={running ? (critical ? "statusWarning" : "gold") : "goldDark"}
      opacity={running ? 1 : 0.75}
    >
      <Text
        fontFamily="mono"
        fontWeight="700"
        fontSize="xl"
        lineHeight="1.1"
        color={critical ? "statusWarning" : low ? "statusWarning" : running ? "gold" : "textSecondary"}
      >
        {format(display)}
      </Text>
    </Box>
  );
}
