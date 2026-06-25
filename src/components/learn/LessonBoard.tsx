"use client";

import { useEffect, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";

const PAL = {
  darkSq: "#9ca3af",
  lightSq: "#e5e7eb",
  selected: "rgba(118,150,86,0.55)",
  legal: "rgba(118,150,86,0.55)",
  spotlight: "rgba(212,175,55,0.85)",
  good: "rgba(76,175,80,0.6)",
  bad: "rgba(220,80,80,0.6)",
  last: "rgba(212,175,55,0.4)",
};

export interface LessonBoardProps {
  fen: string;
  orientation?: "white" | "black";
  interactive: boolean;
  /** Returns true if the move was accepted (parent owns the rules). */
  onMove: (from: string, to: string) => boolean;
  /** Soft gold ring hints (e.g. the target square). */
  spotlight?: string[];
  /** Brief good/bad flash after an attempt. */
  flash?: { square: string; tone: "good" | "bad" } | null;
  lastMove?: { from: string; to: string } | null;
}

export function LessonBoard({
  fen,
  orientation = "white",
  interactive,
  onMove,
  spotlight = [],
  flash,
  lastMove,
}: LessonBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Reset selection whenever the position changes.
  useEffect(() => {
    setSelected(null);
  }, [fen]);

  const chess = useMemo(() => {
    const c = new Chess();
    try {
      c.load(fen, { skipValidation: true });
    } catch {
      /* ignore — show whatever renders */
    }
    return c;
  }, [fen]);

  const legalTargets = useMemo(() => {
    if (!selected) return [] as string[];
    try {
      return chess.moves({ square: selected as Square, verbose: true }).map((m) => m.to);
    } catch {
      return [];
    }
  }, [selected, chess]);

  const tryMove = (from: string, to: string) => {
    const ok = onMove(from, to);
    setSelected(null);
    return ok;
  };

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { background: PAL.last };
    squareStyles[lastMove.to] = { background: PAL.last };
  }
  for (const s of spotlight) {
    squareStyles[s] = { ...(squareStyles[s] ?? {}), boxShadow: `inset 0 0 0 3px ${PAL.spotlight}` };
  }
  if (selected) squareStyles[selected] = { ...(squareStyles[selected] ?? {}), background: PAL.selected };
  for (const t of legalTargets) {
    const occupied = !!chess.get(t as Square);
    squareStyles[t] = occupied
      ? { ...(squareStyles[t] ?? {}), boxShadow: `inset 0 0 0 4px ${PAL.legal}` }
      : { ...(squareStyles[t] ?? {}), background: `radial-gradient(circle, ${PAL.legal} 17%, transparent 19%)` };
  }
  if (flash) squareStyles[flash.square] = { background: flash.tone === "good" ? PAL.good : PAL.bad };

  return (
    <Box w="full" maxW="min(82vmin, 440px)" mx="auto">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: interactive,
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            interactive && targetSquare ? tryMove(sourceSquare, targetSquare) : false,
          onSquareClick: ({ square }) => {
            if (!interactive) return;
            if (selected && legalTargets.includes(square)) {
              tryMove(selected, square);
              return;
            }
            setSelected(chess.get(square as Square) ? square : null);
          },
          squareStyles,
          showNotation: true,
          darkSquareStyle: { backgroundColor: PAL.darkSq },
          lightSquareStyle: { backgroundColor: PAL.lightSq },
          boardStyle: { borderRadius: 10, boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" },
          darkSquareNotationStyle: { fill: "#4b5563", fontSize: 10 },
          lightSquareNotationStyle: { fill: "#6b7280", fontSize: 10 },
        }}
      />
    </Box>
  );
}
