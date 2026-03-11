"use client";

import { useEffect, useState, useRef } from "react";
import { Box } from "@chakra-ui/react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
}

/** Animated counter with smooth number roll-up using requestAnimationFrame */
export function AnimatedCounter({
  value,
  duration = 1500,
  suffix = "",
  prefix = "",
  decimals = 0,
  fontSize = "2xl",
  fontWeight = "700",
  color = "gold",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    const start = startRef.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (end - start) * eased;
      setDisplayValue(decimals > 0 ? Number(next.toFixed(decimals)) : Math.round(next));
      if (progress >= 1) {
        startRef.current = value;
      } else {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value, duration, decimals]);

  return (
    <Box
      as="span"
      display="inline-block"
      fontSize={fontSize}
      fontWeight={fontWeight}
      color={color}
      fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
    >
      {prefix}
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </Box>
  );
}
