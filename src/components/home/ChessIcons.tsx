"use client";

/**
 * Inline SVG chess-piece glyphs (filled, single-colour) for use as feature
 * icons on the marketing site. Sized via fontSize / `style.width`.
 *
 * The shapes are simplified silhouettes — they read at small sizes and don't
 * fight the typography. Use color="currentColor" to inherit from a parent.
 */

import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function svgWrap(size: number, children: React.ReactNode, rest: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="currentColor"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeLinecap="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function KingIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <path d="M32 6v6M28 9h8" strokeWidth="3" />
      <path d="M16 26c0-8 7-12 16-12s16 4 16 12c0 4-3 7-7 8H23c-4-1-7-4-7-8z" strokeWidth="2" />
      <path d="M14 38h36l-3 16H17z" strokeWidth="2" />
      <path d="M22 44h20" strokeWidth="1.5" stroke="currentColor" fill="none" opacity="0.4" />
    </>,
    rest
  );
}

export function QueenIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <circle cx="14" cy="14" r="2.5" strokeWidth="0" />
      <circle cx="32" cy="10" r="2.5" strokeWidth="0" />
      <circle cx="50" cy="14" r="2.5" strokeWidth="0" />
      <circle cx="22" cy="20" r="2" strokeWidth="0" />
      <circle cx="42" cy="20" r="2" strokeWidth="0" />
      <path d="M14 16l8 14h20l8-14-8 8-10-14-10 14-8-8z" strokeWidth="2" />
      <path d="M16 32h32l-3 18H19z" strokeWidth="2" />
    </>,
    rest
  );
}

export function RookIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <path d="M16 12h6v4h6v-4h8v4h6v-4h6v10H16z" strokeWidth="2" />
      <path d="M19 22h26v6H19zM22 28h20l-2 24H24z" strokeWidth="2" />
    </>,
    rest
  );
}

export function BishopIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <circle cx="32" cy="10" r="3" strokeWidth="0" />
      <path
        d="M32 14c-8 0-14 8-14 18 0 6 4 10 14 10s14-4 14-10c0-10-6-18-14-18z"
        strokeWidth="2"
      />
      <path d="M28 26h8" strokeWidth="2" />
      <path d="M22 44h20l-2 10H24z" strokeWidth="2" />
    </>,
    rest
  );
}

export function KnightIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <path
        d="M22 12c0-2 2-4 4-4l10 4c4 2 8 6 9 14l3 12c1 4-2 8-6 8H20l-2-8c0-4 2-6 4-7l4-2-2-6 2-4-2-4 2-2 2-2c-2-1-4 0-6 1z"
        strokeWidth="2"
      />
      <circle cx="40" cy="20" r="1.6" fill="currentColor" stroke="none" opacity="0.4" />
      <path d="M14 50h36l-2 6H16z" strokeWidth="2" />
    </>,
    rest
  );
}

export function PawnIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <circle cx="32" cy="14" r="6" strokeWidth="2" />
      <path d="M22 24h20l-3 8H25z" strokeWidth="2" />
      <path d="M20 36h24l-3 18H23z" strokeWidth="2" />
    </>,
    rest
  );
}

export function CrossedSwordsIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <path d="M10 12l24 24" strokeWidth="3" fill="none" />
      <path d="M54 12L30 36" strokeWidth="3" fill="none" />
      <path d="M10 12h6v6h-6zM48 12h6v6h-6z" strokeWidth="2" />
      <path d="M28 38l4 4 4-4-4-4z" strokeWidth="2" />
    </>,
    rest
  );
}

export function TrophyIcon({ size = 28, ...rest }: IconProps) {
  return svgWrap(
    size,
    <>
      <path
        d="M16 10h32v10c0 8-6 14-14 14h-4c-8 0-14-6-14-14z"
        strokeWidth="2"
      />
      <path d="M16 14h-6c0 8 4 12 8 12M48 14h6c0 8-4 12-8 12" strokeWidth="2" fill="none" />
      <path d="M28 34h8v8h-8zM22 50h20v4H22z" strokeWidth="2" />
    </>,
    rest
  );
}
