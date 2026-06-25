"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";
import type { Arrow } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { findPremoveMove, legalMovesIfSideToMove } from "@/lib/chessPremoves";

export interface PendingPremove {
  from: string;
  to: string;
  promotion?: string;
}

interface GameBoardProps {
  fen: string;
  orientation: "white" | "black";
  /** True when it is this player's turn to move in the game. */
  isMyTurn: boolean;
  /** True when a move request is in flight (blocks input). */
  movePending?: boolean;
  onMove: (move: string) => void;
  allowMove: boolean;
  /** Highlight last move (gold) — squares in algebraic notation */
  lastMove?: { from: string; to: string } | null;
  premoveEnabled?: boolean;
  /** Queued premoves — one for single mode, several when chaining. */
  premoveQueue?: PendingPremove[];
  /** Position premoves are computed against (after the queued premoves, for chaining). Defaults to `fen`. */
  premoveBaseFen?: string;
  onPendingPremove?: (p: PendingPremove) => void;
  /** Drawn on top of last-move / selection highlights (e.g. review mode). */
  extraSquareStyles?: Record<string, React.CSSProperties>;
  /** Engine / review arrows (from → to). */
  reviewArrows?: Arrow[];
  /**
   * Visual variant:
   *   • "classic" (default) — gray squares, gold highlight (CCA classical)
   *   • "system"            — dark void squares, cyan/purple highlight (R2M System UI)
   */
  variant?: "classic" | "system";
  /** Board colour theme (square colours); ignored when variant === "system". */
  boardTheme?: BoardThemeKey;
  /** When false, a pawn reaching the last rank opens a Q/R/B/N picker instead of auto-queening. */
  autoQueen?: boolean;
  /** Piece a *premove* promotion becomes ("q"/"r"/"b"/"n"). */
  premovePromotion?: string;
}

/* ── Classic palette — gold accents on neutral gray squares ─────────── */
const CLASSIC = {
  darkSq: "#9ca3af",
  lightSq: "#e5e7eb",
  selected: "rgba(230, 164, 82, 0.45)",
  legal: "rgba(230, 164, 82, 0.22)",
  last: "rgba(230, 164, 82, 0.55)",
  pre: "rgba(168, 85, 247, 0.42)",
  preLegal: "rgba(168, 85, 247, 0.2)",
  notationDark: "#4b5563",
  notationLight: "#6b7280",
  borderRadius: 12,
  ringShadow: "0 0 0 1px rgba(255,255,255,0.12)",
};

/* ── Board colour themes (square + notation colours; share Classic's highlights) ─ */
export type BoardThemeKey = "classic" | "green" | "brown" | "blue" | "night";
export const BOARD_THEMES: Record<
  BoardThemeKey,
  { label: string; darkSq: string; lightSq: string; notationDark: string; notationLight: string }
> = {
  classic: { label: "Classic", darkSq: "#9ca3af", lightSq: "#e5e7eb", notationDark: "#4b5563", notationLight: "#6b7280" },
  green: { label: "Green", darkSq: "#769656", lightSq: "#eeeed2", notationDark: "#eeeed2", notationLight: "#6f8b4e" },
  brown: { label: "Brown", darkSq: "#b58863", lightSq: "#f0d9b5", notationDark: "#f0d9b5", notationLight: "#9c6f4a" },
  blue: { label: "Blue", darkSq: "#567a9e", lightSq: "#d9e4ef", notationDark: "#d9e4ef", notationLight: "#456486" },
  night: { label: "Night", darkSq: "#3a3f5c", lightSq: "#737aa6", notationDark: "#dfe3ff", notationLight: "#c2c8f0" },
};

/* ── System palette — chamfered, neon, R2M HUD ──────────────────────── */
const SYSTEM = {
  darkSq: "#0e1424",
  lightSq: "#1a2138",
  selected: "rgba(0, 240, 255, 0.45)",
  legal: "rgba(0, 240, 255, 0.22)",
  last: "rgba(0, 240, 255, 0.55)",
  pre: "rgba(138, 43, 226, 0.42)",
  preLegal: "rgba(138, 43, 226, 0.2)",
  notationDark: "rgba(0, 240, 255, 0.5)",
  notationLight: "rgba(177, 151, 252, 0.55)",
  borderRadius: 4,
  ringShadow: "0 0 0 1px rgba(0,240,255,0.35), 0 0 24px rgba(0,240,255,0.25)",
};

const PIECE_GLYPH: Record<"w" | "b", Record<"q" | "r" | "b" | "n", string>> = {
  w: { q: "♕", r: "♖", b: "♗", n: "♘" },
  b: { q: "♛", r: "♜", b: "♝", n: "♞" },
};

export function GameBoard({
  fen,
  orientation,
  isMyTurn,
  movePending = false,
  onMove,
  allowMove,
  lastMove,
  premoveEnabled = false,
  premoveQueue = [],
  premoveBaseFen,
  onPendingPremove,
  extraSquareStyles,
  reviewArrows,
  variant = "classic",
  boardTheme = "classic",
  autoQueen = true,
  premovePromotion = "q",
}: GameBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const palette = variant === "system" ? SYSTEM : { ...CLASSIC, ...BOARD_THEMES[boardTheme] };
  const SELECTED_HIGHLIGHT = palette.selected;
  const LEGAL_MOVE_HIGHLIGHT = palette.legal;
  const LAST_MOVE_HIGHLIGHT = palette.last;
  const PREMOVE_HIGHLIGHT = palette.pre;
  const PREMOVE_LEGAL_HIGHLIGHT = palette.preLegal;

  /**
   * Read-only Chess instance for highlight calculations (legal targets).
   * We rebuild on every fen change. Critically, we do NOT mutate this instance
   * when the user makes a move — mutation would leave a stale board behind for
   * subsequent move validations if the parent's fen update is lost or delayed
   * (which manifested as "move records but pieces don't move" after the engine
   * replied: executeMove had silently accepted a move computed against a mutated
   * stale Chess, and react-chessboard's internal piece animation desynced).
   */
  const game = useMemo(() => {
    const c = new Chess();
    try {
      c.load(fen);
    } catch {
      // invalid fen
    }
    return c;
  }, [fen]);

  const myColor = orientation === "white" ? "w" : "b";
  // Premoves are computed against the position AFTER any already-queued premoves
  // (so chains stack); falls back to the live board when nothing is queued.
  const premoveFen = premoveBaseFen ?? fen;
  const canPlayNow = allowMove && isMyTurn && !movePending;
  const premoveActive = !!(allowMove && premoveEnabled && onPendingPremove && !isMyTurn && !movePending);

  const executeMove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!canPlayNow) return false;
      // Always validate against a FRESH Chess instance loaded from the current
      // fen. Never mutate the memoised `game` — see comment above.
      const probe = new Chess();
      try {
        probe.load(fen);
      } catch {
        return false;
      }
      // Promotion? When auto-queen is off, hold the move and open the picker.
      let isPromotion = false;
      try {
        isPromotion = probe
          .moves({ square: sourceSquare as Square, verbose: true })
          .some((m) => m.to === targetSquare && m.flags.includes("p"));
      } catch {
        /* ignore */
      }
      if (isPromotion && !autoQueen) {
        setPendingPromotion({ from: sourceSquare, to: targetSquare });
        return true;
      }
      try {
        const move = probe.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        if (move) {
          const san = `${move.from}${move.to}`;
          if (move.promotion) {
            onMove(san + move.promotion.toLowerCase());
          } else {
            onMove(san);
          }
          return true;
        }
      } catch {
        // invalid move
      }
      return false;
    },
    [fen, canPlayNow, onMove, autoQueen]
  );

  const completePromotion = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      onMove(`${pendingPromotion.from}${pendingPromotion.to}${piece}`);
      setPendingPromotion(null);
      setSelectedSquare(null);
    },
    [pendingPromotion, onMove]
  );

  const executePremove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!premoveActive || !onPendingPremove) return false;
      const m = findPremoveMove(premoveFen, myColor, sourceSquare as Square, targetSquare as Square);
      if (!m) return false;
      onPendingPremove({
        from: m.from,
        to: m.to,
        promotion: m.promotion ? premovePromotion : undefined,
      });
      return true;
    },
    [premoveActive, onPendingPremove, premoveFen, myColor, premovePromotion]
  );

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (canPlayNow) {
        const ok = executeMove(sourceSquare, targetSquare);
        if (ok) setSelectedSquare(null);
        return ok;
      }
      if (premoveActive) {
        const ok = executePremove(sourceSquare, targetSquare);
        if (ok) setSelectedSquare(null);
        return ok;
      }
      return false;
    },
    [canPlayNow, premoveActive, executeMove, executePremove]
  );

  const canDragPiece = useCallback(
    ({
      piece,
      isSparePiece,
      square,
    }: {
      piece: { pieceType: string };
      isSparePiece: boolean;
      square: string | null;
    }) => {
      if (isSparePiece || !square) return false;
      if (!allowMove || movePending) return false;
      // react-chessboard v5 piece types are colour-prefixed ("wP" / "bP"),
      // so the colour is the first character — NOT the letter case.
      const mine = piece.pieceType.charAt(0) === myColor;
      if (!mine) return false;
      if (canPlayNow) return true;
      if (premoveActive) return true;
      return false;
    },
    [allowMove, movePending, myColor, canPlayNow, premoveActive]
  );

  const legalTargets = useMemo(() => {
    if (!selectedSquare || !canPlayNow) return new Set<string>();
    const moves = game.moves({ square: selectedSquare as Square, verbose: true });
    return new Set(moves.map((m) => m.to));
  }, [game, selectedSquare, canPlayNow]);

  const premoveLegalTargets = useMemo(() => {
    if (!selectedSquare || !premoveActive) return new Set<string>();
    const moves = legalMovesIfSideToMove(premoveFen, myColor).filter((m) => m.from === selectedSquare);
    return new Set(moves.map((m) => m.to));
  }, [premoveFen, myColor, selectedSquare, premoveActive]);

  const isMyPieceType = useCallback(
    (pieceType: string) => {
      // react-chessboard v5 piece types are colour-prefixed ("wP" / "bP"),
      // so the colour is the first character — NOT the letter case.
      return pieceType.charAt(0) === myColor;
    },
    [myColor]
  );

  const handleSquareClick = useCallback(
    ({ square, piece }: { square: string; piece: { pieceType: string } | null }) => {
      if (movePending || !allowMove) return;

      if (canPlayNow) {
        if (selectedSquare) {
          if (legalTargets.has(square)) {
            executeMove(selectedSquare, square);
            setSelectedSquare(null);
          } else if (piece && isMyPieceType(piece.pieceType)) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        } else {
          if (piece && isMyPieceType(piece.pieceType)) {
            setSelectedSquare(square);
          }
        }
        return;
      }

      if (premoveActive && onPendingPremove) {
        if (selectedSquare) {
          if (premoveLegalTargets.has(square)) {
            const m = findPremoveMove(premoveFen, myColor, selectedSquare as Square, square as Square);
            if (m) {
              onPendingPremove({
                from: m.from,
                to: m.to,
                promotion: m.promotion ? premovePromotion : undefined,
              });
            }
            setSelectedSquare(null);
          } else if (piece && isMyPieceType(piece.pieceType)) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        } else {
          if (piece && isMyPieceType(piece.pieceType)) {
            setSelectedSquare(square);
          }
        }
      }
    },
    [
      movePending,
      allowMove,
      canPlayNow,
      premoveActive,
      onPendingPremove,
      selectedSquare,
      legalTargets,
      premoveLegalTargets,
      isMyPieceType,
      executeMove,
      premoveFen,
      myColor,
      premovePromotion,
    ]
  );

  useEffect(() => {
    setSelectedSquare(null);
    setPendingPromotion(null);
  }, [fen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (lastMove?.from) styles[lastMove.from] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
    if (lastMove?.to) styles[lastMove.to] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
    for (const pm of premoveQueue) {
      styles[pm.from] = { ...styles[pm.from], backgroundColor: PREMOVE_HIGHLIGHT };
      styles[pm.to] = { ...styles[pm.to], backgroundColor: PREMOVE_HIGHLIGHT };
    }
    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor: canPlayNow ? SELECTED_HIGHLIGHT : PREMOVE_HIGHLIGHT,
      };
      const targets = canPlayNow ? legalTargets : premoveLegalTargets;
      targets.forEach((sq) => {
        if (!styles[sq]) {
          styles[sq] = {
            backgroundColor: canPlayNow ? LEGAL_MOVE_HIGHLIGHT : PREMOVE_LEGAL_HIGHLIGHT,
          };
        }
      });
    }
    if (extraSquareStyles) {
      for (const [sq, st] of Object.entries(extraSquareStyles)) {
        styles[sq] = { ...styles[sq], ...st };
      }
    }
    return styles;
  }, [
    selectedSquare,
    legalTargets,
    premoveLegalTargets,
    lastMove,
    premoveQueue,
    canPlayNow,
    extraSquareStyles,
    LAST_MOVE_HIGHLIGHT,
    LEGAL_MOVE_HIGHLIGHT,
    PREMOVE_HIGHLIGHT,
    PREMOVE_LEGAL_HIGHLIGHT,
    SELECTED_HIGHLIGHT,
  ]);

  const allowDragging = canPlayNow || premoveActive;

  return (
    <Box>
      <div style={{ position: "relative", maxWidth: "min(90vmin, 720px)", margin: "0 auto" }}>
        {pendingPromotion && (
          <Box
            position="absolute"
            inset={0}
            zIndex={10}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="blackAlpha.600"
            borderRadius={`${palette.borderRadius}px`}
            onClick={() => setPendingPromotion(null)}
          >
            <HStack gap={2} bg="bgCard" p={3} borderRadius="soft" borderWidth="1px" borderColor="gold" onClick={(e) => e.stopPropagation()}>
              {(["q", "r", "b", "n"] as const).map((p) => (
                <Box
                  key={p}
                  as="button"
                  onClick={() => completePromotion(p)}
                  w="52px"
                  h="52px"
                  borderRadius="soft"
                  bg="bgSurface"
                  borderWidth="1px"
                  borderColor="goldDark"
                  _hover={{ borderColor: "gold", bg: "whiteAlpha.100" }}
                  fontSize="34px"
                  lineHeight="1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {PIECE_GLYPH[myColor][p]}
                </Box>
              ))}
            </HStack>
          </Box>
        )}
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging,
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              targetSquare ? onDrop(sourceSquare, targetSquare) : false,
            canDragPiece,
            onSquareClick: handleSquareClick,
            squareStyles,
            dropSquareStyle: {
              backgroundColor: canPlayNow ? LEGAL_MOVE_HIGHLIGHT : PREMOVE_LEGAL_HIGHLIGHT,
            },
            showNotation: true,
            darkSquareStyle: { backgroundColor: palette.darkSq },
            lightSquareStyle: { backgroundColor: palette.lightSq },
            boardStyle: { borderRadius: palette.borderRadius, boxShadow: palette.ringShadow },
            darkSquareNotationStyle: { fill: palette.notationDark, fontSize: 11 },
            lightSquareNotationStyle: { fill: palette.notationLight, fontSize: 11 },
            alphaNotationStyle: { fill: palette.notationLight, fontSize: 11 },
            numericNotationStyle: { fill: palette.notationLight, fontSize: 11 },
            arrows: reviewArrows ?? [],
            clearArrowsOnPositionChange: true,
          }}
        />
      </div>
    </Box>
  );
}
