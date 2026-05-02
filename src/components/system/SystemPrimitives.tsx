"use client";

import { Box, BoxProps } from "@chakra-ui/react";

/**
 * Visual primitives for the "Solo Leveling" System UI:
 * — chamfered panels (clip-path)
 * — angled buttons
 * — corner brackets
 * — neon scan lines
 *
 * These are intentionally raw — we want the elements to feel forged for a
 * game HUD, not adapted from a generic component library.
 */

const PANEL_CLIP = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const PANEL_CLIP_INNER = "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)";

export type GlowAccent = "cyan" | "purple" | "epic" | "threat" | "gold";

const ACCENT_TOKEN: Record<GlowAccent, string> = {
  cyan: "var(--chakra-colors-sysCyan)",
  purple: "var(--chakra-colors-sysPurple)",
  epic: "var(--chakra-colors-sysEpic)",
  threat: "var(--chakra-colors-sysThreat)",
  gold: "var(--chakra-colors-gold)",
};

const ACCENT_RGB: Record<GlowAccent, string> = {
  cyan: "0, 240, 255",
  purple: "138, 43, 226",
  epic: "177, 151, 252",
  threat: "240, 101, 149",
  gold: "230, 164, 82",
};

interface SystemPanelProps extends Omit<BoxProps, "border"> {
  accent?: GlowAccent;
  /** Glow intensity ring around the panel */
  glow?: "none" | "soft" | "strong";
  /** Adds animated corner brackets */
  brackets?: boolean;
}

/**
 * Glassmorphism panel with chamfered top-left + bottom-right corners.
 * Renders an outer "frame" (the accent stroke) and an inner blurred layer.
 */
export function SystemPanel({
  accent = "cyan",
  glow = "soft",
  brackets = false,
  children,
  ...rest
}: SystemPanelProps) {
  const ring = ACCENT_TOKEN[accent];
  const rgb = ACCENT_RGB[accent];
  const glowFilter =
    glow === "strong"
      ? `0 0 24px rgba(${rgb}, 0.45), 0 0 60px rgba(${rgb}, 0.18)`
      : glow === "soft"
        ? `0 0 14px rgba(${rgb}, 0.25)`
        : "none";

  return (
    <Box
      position="relative"
      style={{ clipPath: PANEL_CLIP }}
      bg={ring}
      filter={`drop-shadow(${glowFilter.split(",")[0]})`}
      {...rest}
    >
      <Box
        position="absolute"
        inset="1px"
        style={{ clipPath: PANEL_CLIP_INNER }}
        bg="sysGlass"
        backdropFilter="blur(14px)"
      />
      {brackets && <Brackets accent={accent} />}
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
}

/** Four small neon corner-brackets for emphasis. */
export function Brackets({ accent = "cyan" as GlowAccent }: { accent?: GlowAccent }) {
  const c = ACCENT_TOKEN[accent];
  const corners = [
    { top: 4, left: 4, borderTopWidth: "1px", borderLeftWidth: "1px" },
    { top: 4, right: 4, borderTopWidth: "1px", borderRightWidth: "1px" },
    { bottom: 4, left: 4, borderBottomWidth: "1px", borderLeftWidth: "1px" },
    { bottom: 4, right: 4, borderBottomWidth: "1px", borderRightWidth: "1px" },
  ];
  return (
    <>
      {corners.map((s, i) => (
        <Box
          key={i}
          position="absolute"
          w="14px"
          h="14px"
          borderColor={c}
          pointerEvents="none"
          zIndex={2}
          {...s}
        />
      ))}
    </>
  );
}

const BTN_CLIP = "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";
const BTN_CLIP_INNER = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";

interface SystemButtonProps extends Omit<BoxProps, "border" | "as"> {
  accent?: GlowAccent;
  size?: "md" | "lg" | "xl";
  onClick?: () => void;
  /** Renders as an <a> if href provided. */
  href?: string;
  disabled?: boolean;
}

/** Chamfered "RPG menu" button. */
export function SystemButton({
  accent = "cyan",
  size = "lg",
  onClick,
  href,
  disabled,
  children,
  ...rest
}: SystemButtonProps) {
  const ring = ACCENT_TOKEN[accent];
  const rgb = ACCENT_RGB[accent];
  const padX = size === "xl" ? 10 : size === "lg" ? 8 : 6;
  const padY = size === "xl" ? 5 : size === "lg" ? 4 : 3;
  const fs = size === "xl" ? "lg" : size === "lg" ? "md" : "sm";

  const inner = (
    <Box
      style={{ clipPath: BTN_CLIP }}
      bg={ring}
      transition="all 0.2s"
      filter={`drop-shadow(0 0 8px rgba(${rgb}, 0.35))`}
      _hover={
        !disabled
          ? {
              filter: `drop-shadow(0 0 18px rgba(${rgb}, 0.7)) drop-shadow(0 0 36px rgba(${rgb}, 0.35))`,
              transform: "translateY(-1px)",
            }
          : undefined
      }
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.4 : 1}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      <Box
        style={{ clipPath: BTN_CLIP_INNER }}
        bg="sysVoid"
        px={padX}
        py={padY}
        position="relative"
      >
        <Box
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          fontSize={fs}
          fontWeight="700"
          letterSpacing="0.16em"
          textTransform="uppercase"
          color={ring}
          textAlign="center"
          textShadow={`0 0 6px rgba(${rgb}, 0.6)`}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );

  if (href) {
    return (
      <a href={href} aria-disabled={disabled} style={{ textDecoration: "none" }}>
        {inner}
      </a>
    );
  }
  return inner;
}

/** Mono / system label text — used for "rank" / "level" etc. */
export function SystemLabel({ children, accent = "cyan" }: { children: React.ReactNode; accent?: GlowAccent }) {
  return (
    <Box
      as="span"
      color={ACCENT_TOKEN[accent]}
      fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
      fontSize="xs"
      fontWeight="700"
      letterSpacing="0.18em"
      textTransform="uppercase"
      textShadow={`0 0 6px rgba(${ACCENT_RGB[accent]}, 0.55)`}
    >
      {children}
    </Box>
  );
}

/** Animated horizontal scan-line — useful inside the level-up modal. */
export function ScanLine({ accent = "cyan" }: { accent?: GlowAccent }) {
  const c = ACCENT_TOKEN[accent];
  return (
    <Box
      position="absolute"
      left={0}
      right={0}
      h="1px"
      bg={c}
      boxShadow={`0 0 8px ${c}, 0 0 18px ${c}`}
      pointerEvents="none"
      style={{
        animation: "system-scan 4s linear infinite",
      }}
    />
  );
}

export const SYSTEM_KEYFRAMES = `
@keyframes system-scan {
  0%   { top: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes system-pulse {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.04); }
}
@keyframes system-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
@keyframes system-spin-slow {
  to { transform: rotate(360deg); }
}
@keyframes system-glitch {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-2px); }
  40%      { transform: translateX(2px); }
  60%      { transform: translateX(-1px); }
}
@keyframes system-slash {
  0%   { transform: translate(-120%, 0) skewX(-20deg); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: translate(120%, 0) skewX(-20deg); opacity: 0; }
}
@keyframes system-modal-in {
  0%   { transform: scale(0.6); opacity: 0; filter: blur(20px); }
  60%  { opacity: 1; filter: blur(0); }
  100% { transform: scale(1); opacity: 1; filter: blur(0); }
}
`;
