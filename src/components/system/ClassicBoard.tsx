"use client";

import { Box } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";

/**
 * ClassicBoard — react-chessboard with the same warm wood palette used
 * on the landing page (cream light / espresso dark). Built specifically
 * for the R2M training surfaces (Shadow Extraction, Memory Echo) where
 * piece legibility matters more than HUD aesthetic.
 *
 * The neon System chrome is still applied at the parent level (chamfered
 * frame, corner brackets, glow ring) — this component is only the board.
 */

/* Three readable palettes the consumer can opt into. */
const PALETTES = {
  /** Warm wood used on the landing showcase + Shadow Extraction. */
  wood: {
    light: "#e9d8a3",
    dark: "#3a2f24",
    darkNotation: "rgba(255,255,255,0.55)",
    lightNotation: "rgba(0,0,0,0.55)",
  },
  /** Bright sky-blue board — used on the puzzle (Learn) surface. */
  blue: {
    light: "#e8eef7",
    dark: "#7196c0",
    darkNotation: "rgba(255,255,255,0.7)",
    lightNotation: "rgba(40,60,90,0.6)",
  },
  /** Muted slate — for analysis / review surfaces. */
  slate: {
    light: "#d6dbe2",
    dark: "#5a6878",
    darkNotation: "rgba(255,255,255,0.6)",
    lightNotation: "rgba(40,60,90,0.55)",
  },
} as const;

export type ClassicBoardVariant = keyof typeof PALETTES;

interface ClassicBoardProps {
  /** Position to render (FEN). Use the empty FEN to render a blank board. */
  fen: string;
  /** Side to display from — defaults to white. */
  orientation?: "white" | "black";
  /** Pixel side length of the board. */
  size?: number;
  /** When true, pieces can be dragged to move (uses onSquareClick fallback). */
  allowDragging?: boolean;
  /** Click handler — fires with the algebraic square and the piece (if any). */
  onSquareClick?: (square: string) => void;
  /** Right-click handler — useful for clearing a square in recall trials. */
  onSquareRightClick?: (square: string) => void;
  /** Optional `onPieceDrop` for drag-and-drop moves. */
  onPieceDrop?: (from: string, to: string) => boolean;
  /** Optional override `squareStyles` map. */
  squareStyles?: Record<string, React.CSSProperties>;
  /** Colour palette — wood (default) / blue / slate. */
  variant?: ClassicBoardVariant;
}

export function ClassicBoard({
  fen,
  orientation = "white",
  size = 360,
  allowDragging = false,
  onSquareClick,
  onSquareRightClick,
  onPieceDrop,
  squareStyles,
  variant = "wood",
}: ClassicBoardProps) {
  const palette = PALETTES[variant];
  return (
    <Box w={`${size}px`} h={`${size}px`} maxW="full">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging,
          showNotation: true,
          darkSquareStyle: { backgroundColor: palette.dark },
          lightSquareStyle: { backgroundColor: palette.light },
          boardStyle: { borderRadius: 6 },
          darkSquareNotationStyle: { fill: palette.darkNotation, fontSize: 11 },
          lightSquareNotationStyle: { fill: palette.lightNotation, fontSize: 11 },
          alphaNotationStyle: { fill: palette.lightNotation, fontSize: 11 },
          numericNotationStyle: { fill: palette.lightNotation, fontSize: 11 },
          onSquareClick: onSquareClick
            ? ({ square }) => onSquareClick(square)
            : undefined,
          onSquareRightClick: onSquareRightClick
            ? ({ square }) => onSquareRightClick(square)
            : undefined,
          onPieceDrop: onPieceDrop
            ? ({ sourceSquare, targetSquare }) =>
                targetSquare ? onPieceDrop(sourceSquare, targetSquare) : false
            : undefined,
          squareStyles,
        }}
      />
    </Box>
  );
}

/* ─────────── FEN helpers (shared by Memory Echo / Shadow Extraction) ─────────── */

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export const EMPTY_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

/**
 * Build a FEN from a piece map. The piece map's values are single chars in
 * standard FEN notation ("K" white king, "p" black pawn, etc.).
 */
export function fenFromMap(
  pieces: Record<string, string>,
  turn: "w" | "b" = "w"
): string {
  const ranks: string[] = [];
  for (let r = 8; r >= 1; r--) {
    let line = "";
    let empty = 0;
    for (const f of FILES) {
      const sq = `${f}${r}`;
      const p = pieces[sq];
      if (p) {
        if (empty > 0) {
          line += empty;
          empty = 0;
        }
        line += p;
      } else {
        empty++;
      }
    }
    if (empty > 0) line += empty;
    ranks.push(line);
  }
  return `${ranks.join("/")} ${turn} - - 0 1`;
}
