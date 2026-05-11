"use client";

import { Box, BoxProps, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";

/**
 * Luxury Academic primitives — gold-on-obsidian, glass surfaces, Playfair
 * headlines, Inter UI. Separate from the System (R2M) HUD so the daily-
 * driver dashboard / play surface has its own quieter, more sophisticated
 * voice while still living on the same dark canvas.
 *
 *   • GlassCard       — floating frosted-glass card with 1px border
 *   • LuxuryButton    — gradient-gold pill button (8px radius)
 *   • LuxuryHeading   — Playfair Display headline with 0.05em tracking
 *   • LuxuryEyebrow   — uppercase Inter section eyebrow tag
 *   • LuxuryStat      — labelled stat (eyebrow + serif figure)
 *   • Divider         — thin gold-tinted horizontal rule
 *   • GoldRule        — short 32px gold dash under headlines
 *   • ChessWatermark  — large low-opacity SVG chess piece for backdrops
 */

/* ─────────── GlassCard ─────────── */

interface GlassCardProps extends BoxProps {
  /** Stronger surface + brighter border for hero / featured cards. */
  hero?: boolean;
  /** Render as <Link> when href provided. Hover lift is added. */
  href?: string;
  /** Optional gold gradient wash from top-left. */
  goldWash?: boolean;
}

export function GlassCard({
  hero = false,
  href,
  goldWash = false,
  children,
  ...rest
}: GlassCardProps) {
  const inner = (
    <Box
      position="relative"
      className={hero ? "lux-glass-strong" : "lux-glass"}
      borderRadius="8px"
      overflow="hidden"
      transition="transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease"
      _hover={
        href
          ? {
              transform: "translateY(-2px)",
              borderColor: "rgba(212, 175, 55, 0.4) !important",
              boxShadow: "var(--lux-shadow-card-hover)",
            }
          : undefined
      }
      {...rest}
    >
      {goldWash && (
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          style={{ background: "var(--lux-gradient-hero)" }}
        />
      )}
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
  if (href) {
    return (
      <Link href={href} style={{ display: "block", textDecoration: "none" }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

/* ─────────── LuxuryButton ─────────── */

interface LuxuryButtonProps extends Omit<BoxProps, "as"> {
  /** Visual: gold (filled gradient) / ghost (glass) / outline (1px gold). */
  variant?: "gold" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Optional left glyph (e.g. ▶, ←, ↻). */
  glyph?: string;
  full?: boolean;
  type?: "button" | "submit";
}

export function LuxuryButton({
  variant = "gold",
  size = "md",
  href,
  onClick,
  disabled,
  glyph,
  full = false,
  children,
  type = "button",
  ...rest
}: LuxuryButtonProps) {
  const pad = size === "lg" ? { px: 8, py: 3.5 } : size === "sm" ? { px: 4, py: 2 } : { px: 6, py: 2.5 };
  const fs = size === "lg" ? "md" : size === "sm" ? "xs" : "sm";

  const baseProps: BoxProps = {
    borderRadius: "8px",
    display: full ? "block" : "inline-flex",
    w: full ? "full" : undefined,
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "all 0.2s ease",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: fs,
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    ...pad,
  };

  let variantProps: BoxProps;
  if (variant === "gold") {
    variantProps = {
      background: "var(--lux-gradient-gold)",
      color: "#1a1410",
      boxShadow: "var(--lux-shadow-button)",
      _hover: !disabled
        ? {
            boxShadow: "var(--lux-shadow-button-hover)",
            transform: "translateY(-1px)",
            background: "linear-gradient(180deg, #f4d678 0%, #e0bb44 52%, #b0871f 100%)",
          }
        : undefined,
      _active: !disabled ? { transform: "translateY(0)" } : undefined,
    };
  } else if (variant === "outline") {
    variantProps = {
      bg: "transparent",
      borderWidth: "1px",
      borderColor: "var(--lux-gold)",
      color: "var(--lux-gold)",
      _hover: !disabled
        ? {
            bg: "rgba(212, 175, 55, 0.08)",
            transform: "translateY(-1px)",
            borderColor: "var(--lux-gold-bright)",
          }
        : undefined,
    };
  } else {
    variantProps = {
      background: "var(--lux-gradient-ghost)",
      borderWidth: "1px",
      borderColor: "var(--lux-glass-border)",
      color: "var(--lux-text-primary)",
      _hover: !disabled
        ? {
            borderColor: "rgba(212, 175, 55, 0.45)",
            color: "var(--lux-gold-bright)",
            transform: "translateY(-1px)",
          }
        : undefined,
    };
  }

  const content = (
    <HStack gap={glyph ? 2.5 : 0} justify="center" align="center">
      {glyph && (
        <Box as="span" fontSize={size === "lg" ? "lg" : "md"} lineHeight="1">
          {glyph}
        </Box>
      )}
      <Box as="span">{children}</Box>
    </HStack>
  );

  const node = (
    <Box {...baseProps} {...variantProps} onClick={disabled ? undefined : onClick} {...rest}>
      {content}
    </Box>
  );

  if (href) {
    return (
      <Link
        href={href}
        style={{ textDecoration: "none", display: full ? "block" : "inline-block" }}
      >
        {node}
      </Link>
    );
  }
  if (onClick || type === "submit") {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          width: full ? "100%" : undefined,
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          font: "inherit",
          color: "inherit",
        }}
      >
        <Box {...baseProps} {...variantProps} {...rest}>
          {content}
        </Box>
      </button>
    );
  }
  return node;
}

/* ─────────── Typography ─────────── */

interface LuxuryHeadingProps {
  as?: "h1" | "h2" | "h3";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children: React.ReactNode;
}

const HEADING_FS: Record<NonNullable<LuxuryHeadingProps["size"]>, string> = {
  xs: "lg",
  sm: "xl",
  md: "2xl",
  lg: "3xl",
  xl: "4xl",
  "2xl": "5xl",
  "3xl": "6xl",
};

export function LuxuryHeading({ as = "h2", size = "lg", children }: LuxuryHeadingProps) {
  return (
    <Text
      as={as}
      className="lux-heading"
      fontSize={HEADING_FS[size]}
      lineHeight="1.05"
    >
      {children}
    </Text>
  );
}

export function LuxuryEyebrow({ children }: { children: React.ReactNode }) {
  return <Text className="lux-eyebrow">{children}</Text>;
}

/* ─────────── Stat ─────────── */

export function LuxuryStat({
  label,
  value,
  hint,
  emphasis = "normal",
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: "normal" | "gold";
}) {
  return (
    <Box>
      <LuxuryEyebrow>{label}</LuxuryEyebrow>
      <Text
        fontFamily="var(--font-playfair), Georgia, serif"
        fontSize={{ base: "3xl", md: "4xl" }}
        fontWeight="600"
        color={emphasis === "gold" ? "var(--lux-gold)" : "var(--lux-text-primary)"}
        lineHeight="1"
        mt={1.5}
        letterSpacing="0.02em"
      >
        {value}
      </Text>
      {hint && (
        <Text fontSize="xs" mt={1} className="lux-text-muted">
          {hint}
        </Text>
      )}
    </Box>
  );
}

/* ─────────── Divider / GoldRule ─────────── */

export function LuxuryDivider() {
  return <Box className="lux-divider" />;
}

export function GoldRule({ wide = false }: { wide?: boolean }) {
  return <Box className="lux-rule-gold" style={wide ? { width: 64 } : undefined} />;
}

/* ─────────── ChessWatermark ─────────── */

/**
 * Low-opacity decorative chess piece for section backdrops.
 * Renders an SVG silhouette positioned absolutely behind content.
 */
export function ChessWatermark({
  piece = "king",
  size = 320,
  position = { top: "8%", right: "-2%" },
  opacity = 0.04,
  tint = "var(--lux-gold)",
}: {
  piece?: "king" | "queen" | "knight" | "bishop" | "rook" | "pawn";
  size?: number;
  position?: { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number };
  opacity?: number;
  tint?: string;
}) {
  return (
    <Box
      position="absolute"
      width={`${size}px`}
      height={`${size}px`}
      pointerEvents="none"
      zIndex={0}
      style={{ ...position, opacity, color: tint }}
    >
      <ChessPieceSvg piece={piece} />
    </Box>
  );
}

function ChessPieceSvg({ piece }: { piece: "king" | "queen" | "knight" | "bishop" | "rook" | "pawn" }) {
  // Inline Unicode is reliable at any size — the symbols are well-anti-aliased
  // by every browser font stack and inherit `currentColor`.
  const glyph: Record<string, string> = {
    king: "♚",
    queen: "♛",
    knight: "♞",
    bishop: "♝",
    rook: "♜",
    pawn: "♟",
  };
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontSize="86"
        fill="currentColor"
        fontFamily="serif"
        style={{ filter: "drop-shadow(0 0 12px currentColor)" }}
      >
        {glyph[piece]}
      </text>
    </svg>
  );
}
