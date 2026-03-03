"use client";

import { Box } from "@chakra-ui/react";

const OVERLAY = "linear-gradient(180deg, rgba(17, 19, 24, 0.92) 0%, rgba(17, 19, 24, 0.97) 100%)";

export interface BlendedBackgroundProps {
  /** Image path (e.g. /images/ubca/board-top.png) */
  src: string;
  /** Overlay gradient for readability. Default: dark CCA overlay */
  overlay?: string;
  /** Blend mode for the image layer */
  blendMode?: "normal" | "multiply" | "overlay" | "soft-light";
  /** Opacity of the image before overlay (0–1). Default 0.35 */
  imageOpacity?: number;
  children?: React.ReactNode;
}

/**
 * Full-area layer that blends a background image with a dark overlay.
 * Use as a wrapper so content sits on top; keeps text readable.
 */
export function BlendedBackground({
  src,
  overlay = OVERLAY,
  blendMode = "multiply",
  imageOpacity = 0.35,
  children,
}: BlendedBackgroundProps) {
  return (
    <Box
      position="relative"
      w="full"
      overflow="hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Image layer */}
      <Box
        position="absolute"
        inset={0}
        opacity={imageOpacity}
        style={{
          mixBlendMode: blendMode,
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        pointerEvents="none"
        zIndex={0}
      />
      {/* Dark overlay for contrast */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        zIndex={1}
        style={{ background: overlay }}
      />
      {/* Content */}
      <Box position="relative" zIndex={2} w="full" minH="100%">
        {children}
      </Box>
    </Box>
  );
}
