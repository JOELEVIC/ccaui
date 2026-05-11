"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { Chess } from "chess.js";
import {
  SystemPanel,
  SystemButton,
  SystemLabel,
  SYSTEM_KEYFRAMES,
} from "./SystemPrimitives";

/**
 * Memory Echo — visualization training.
 *
 * 1) "Preview"  : the player sees a position for `revealMs` milliseconds.
 * 2) "Recall"   : the board is cleared. The player reconstructs piece
 *                 placement by clicking a square then choosing a piece from
 *                 the palette. Right-click clears.
 * 3) "Review"   : the system reveals the answer overlay — correct squares
 *                 glow cyan, wrong squares pulse threat-red. Score is
 *                 surfaced and the player can move on.
 *
 * Required to unlock "Red Gates" (boss levels). Hard mode: only piece TYPE
 * is graded, not colour. Default: both must match.
 */

type Piece = "K" | "Q" | "R" | "B" | "N" | "P" | "k" | "q" | "r" | "b" | "n" | "p";
type Square = string; // "a1".."h8"
type Board = Record<Square, Piece>;

interface MemoryEchoProps {
  /** Positions to test (FEN). One is chosen at random per round. */
  positions?: string[];
  /** Milliseconds the position is visible. */
  revealMs?: number;
  /** Called with the percentage score (0–100) when the player finishes. */
  onComplete?: (score: number) => void;
}

const DEFAULT_POSITIONS: string[] = [
  // Mid-game and tactical study positions across different complexity tiers.
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  "r3k2r/ppqnbppp/2p1pn2/3p4/3P1B2/2NBPN2/PPPQ1PPP/2KR3R w kq - 4 9",
  "r2q1rk1/pp2bppp/2nbpn2/2pp4/3P4/2NBPN2/PPP1QPPP/R1B2RK1 w - - 0 8",
  "r4rk1/pp2qpbp/2np1np1/2p1p1B1/2P1P3/2NPB2P/PP3PP1/R2Q1RK1 w - - 4 12",
];

const PIECE_GLYPH: Record<Piece, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

function boardFromFen(fen: string): Board {
  const c = new Chess(fen);
  const out: Board = {};
  // chess.js board() returns rank 8 → rank 1
  c.board().forEach((row, rIdx) => {
    row.forEach((sq, fIdx) => {
      if (!sq) return;
      const file = FILES[fIdx];
      const rank = 8 - rIdx;
      const piece = (sq.color === "w" ? sq.type.toUpperCase() : sq.type) as Piece;
      out[`${file}${rank}`] = piece;
    });
  });
  return out;
}

type Phase = "preview" | "recall" | "review";

export function MemoryEcho({
  positions = DEFAULT_POSITIONS,
  revealMs = 6000,
  onComplete,
}: MemoryEchoProps) {
  const target = useMemo(() => {
    const fen = positions[Math.floor(Math.random() * positions.length)];
    return { fen, board: boardFromFen(fen) };
  }, [positions]);

  const [phase, setPhase] = useState<Phase>("preview");
  const [remaining, setRemaining] = useState<number>(Math.ceil(revealMs / 1000));
  const [recall, setRecall] = useState<Board>({});
  const [selected, setSelected] = useState<Square | null>(null);

  // Preview countdown
  useEffect(() => {
    if (phase !== "preview") return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, Math.ceil((revealMs - elapsed) / 1000));
      setRemaining(left);
      if (elapsed >= revealMs) {
        clearInterval(interval);
        setPhase("recall");
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, revealMs]);

  // Allow user to submit early
  const submit = useCallback(() => {
    setPhase("review");
    // Score: count of squares whose placement matches the target.
    let correct = 0;
    const allSquares = new Set<Square>([
      ...Object.keys(target.board),
      ...Object.keys(recall),
    ]);
    allSquares.forEach((sq) => {
      if (target.board[sq] === recall[sq]) correct++;
    });
    const total = Object.keys(target.board).length;
    const score = total > 0 ? Math.round((Math.min(correct, total) / total) * 100) : 0;
    onComplete?.(score);
  }, [recall, target.board, onComplete]);

  function placePiece(p: Piece) {
    if (!selected || phase !== "recall") return;
    setRecall((prev) => ({ ...prev, [selected]: p }));
    setSelected(null);
  }

  function clearSquare(sq: Square) {
    setRecall((prev) => {
      const { [sq]: _, ...rest } = prev;
      void _;
      return rest;
    });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <SystemPanel accent="purple" glow="strong" brackets p={{ base: 5, md: 7 }}>
        <VStack align="stretch" gap={5}>
          <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
            <Box>
              <SystemLabel accent="purple">[ Memory Echo · Visualization Trial ]</SystemLabel>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "2xl", md: "3xl" }}
                color="textPrimary"
                fontWeight="700"
                mt={1}
              >
                Recall the position
              </Text>
              <Text fontSize="sm" color="textSecondary" mt={1}>
                {phase === "preview" && `Study every piece. Vanish in ${remaining}s.`}
                {phase === "recall" && "Tap a square, choose a piece. Right-click to clear."}
                {phase === "review" && "Result revealed."}
              </Text>
            </Box>
            <PhasePill phase={phase} />
          </HStack>

          <HStack
            gap={6}
            align="flex-start"
            flexWrap={{ base: "wrap", lg: "nowrap" }}
            justify={{ base: "center", lg: "flex-start" }}
          >
            <BoardSvg
              board={phase === "preview" ? target.board : recall}
              target={target.board}
              phase={phase}
              selected={selected}
              onSelectSquare={(sq, e) => {
                if (phase !== "recall") return;
                if (e?.shiftKey || e?.metaKey) {
                  clearSquare(sq);
                  return;
                }
                setSelected((prev) => (prev === sq ? null : sq));
              }}
              onRightClickSquare={clearSquare}
            />

            <VStack flex={1} align="stretch" gap={4} minW={{ base: "full", lg: "260px" }}>
              <PiecePalette
                disabled={phase !== "recall"}
                hasSquareSelected={Boolean(selected)}
                onPick={placePiece}
              />

              <Box
                p={3}
                borderWidth="1px"
                borderColor="rgba(138,43,226,0.35)"
                bg="rgba(10,11,14,0.55)"
                className="sys-clip-panel-sm"
              >
                <SystemLabel accent="purple">Trial Status</SystemLabel>
                <Text fontSize="sm" color="textSecondary" mt={1.5}>
                  Pieces placed:{" "}
                  <Box as="span" color="sysCyan" fontWeight="700">
                    {Object.keys(recall).length}
                  </Box>{" "}
                  / {Object.keys(target.board).length}
                </Text>
                {phase === "review" && (
                  <Text fontSize="lg" color="sysCyan" fontWeight="800" mt={2}>
                    {scoreFor(target.board, recall)}% recall
                  </Text>
                )}
              </Box>

              <VStack align="stretch" gap={2}>
                {phase === "preview" && (
                  <SystemButton accent="cyan" onClick={() => setPhase("recall")}>
                    Begin Recall Early
                  </SystemButton>
                )}
                {phase === "recall" && (
                  <SystemButton accent="purple" onClick={submit}>
                    Submit Echo
                  </SystemButton>
                )}
                {phase === "review" && (
                  <SystemButton accent="cyan" onClick={() => window.location.reload()}>
                    New Position
                  </SystemButton>
                )}
              </VStack>
            </VStack>
          </HStack>
        </VStack>
      </SystemPanel>
    </>
  );
}

function scoreFor(target: Board, recall: Board): number {
  let correct = 0;
  const all = new Set<Square>([...Object.keys(target), ...Object.keys(recall)]);
  all.forEach((sq) => {
    if (target[sq] === recall[sq]) correct++;
  });
  const total = Object.keys(target).length;
  return total > 0 ? Math.round((Math.min(correct, total) / total) * 100) : 0;
}

/* ─────────── Subcomponents ─────────── */

function PhasePill({ phase }: { phase: Phase }) {
  const map: Record<Phase, { label: string; accent: string }> = {
    preview: { label: "Phase 1 · Preview", accent: "var(--sys-cyan)" },
    recall: { label: "Phase 2 · Recall", accent: "var(--sys-purple)" },
    review: { label: "Phase 3 · Review", accent: "var(--sys-epic)" },
  };
  const c = map[phase];
  return (
    <Box
      px={3}
      py={1.5}
      className="sys-clip-panel-sm"
      borderWidth="1px"
      borderColor={c.accent}
      bg="rgba(10,11,14,0.55)"
      style={{ boxShadow: `0 0 12px ${c.accent}33` }}
    >
      <Text
        fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
        fontSize="2xs"
        fontWeight="800"
        color={c.accent}
        letterSpacing="0.2em"
        textTransform="uppercase"
      >
        {c.label}
      </Text>
    </Box>
  );
}

function BoardSvg({
  board,
  target,
  phase,
  selected,
  onSelectSquare,
  onRightClickSquare,
}: {
  board: Board;
  target: Board;
  phase: Phase;
  selected: Square | null;
  onSelectSquare: (sq: Square, e?: React.MouseEvent) => void;
  onRightClickSquare: (sq: Square) => void;
}) {
  const SQ = 44;
  const W = SQ * 8;
  return (
    <Box
      position="relative"
      w={`${W}px`}
      h={`${W}px`}
      borderWidth="1px"
      borderColor="rgba(138,43,226,0.6)"
      bg="rgba(10,11,14,0.6)"
      style={{ boxShadow: "0 0 18px rgba(138,43,226,0.45)" }}
      flexShrink={0}
    >
      <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
        {RANKS.map((rank, rIdx) =>
          FILES.map((file, fIdx) => {
            const sq = `${file}${rank}` as Square;
            const x = fIdx * SQ;
            const y = rIdx * SQ;
            const dark = (rIdx + fIdx) % 2 === 1;
            const isSelected = selected === sq;
            const placed = board[sq];

            // In review, the square's fill reflects correctness.
            let fill = dark ? "#0e1424" : "#1a2138";
            if (phase === "review") {
              const expected = target[sq];
              const actual = board[sq];
              if (expected && expected === actual) fill = "rgba(0,240,255,0.18)";
              else if (expected && actual && expected !== actual) fill = "rgba(240,101,149,0.28)";
              else if (expected && !actual) fill = "rgba(240,101,149,0.18)";
              else if (!expected && actual) fill = "rgba(240,101,149,0.35)";
            }

            return (
              <g key={sq}>
                <rect
                  x={x}
                  y={y}
                  width={SQ}
                  height={SQ}
                  fill={fill}
                  stroke={isSelected ? "var(--sys-cyan)" : "rgba(255,255,255,0.05)"}
                  strokeWidth={isSelected ? 2 : 0.5}
                  onClick={(e) => onSelectSquare(sq, e as unknown as React.MouseEvent)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onRightClickSquare(sq);
                  }}
                  style={{ cursor: phase === "recall" ? "pointer" : "default" }}
                />
                {placed && (
                  <text
                    x={x + SQ / 2}
                    y={y + SQ / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={SQ * 0.78}
                    fill={placed === placed.toUpperCase() ? "#f0f2f8" : "#1a1f2e"}
                    stroke={placed === placed.toUpperCase() ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.25)"}
                    strokeWidth={0.5}
                    pointerEvents="none"
                  >
                    {PIECE_GLYPH[placed]}
                  </text>
                )}
                {/* Coordinate labels */}
                {fIdx === 0 && (
                  <text
                    x={x + 3}
                    y={y + 11}
                    fontSize={9}
                    fill="rgba(255,255,255,0.4)"
                    pointerEvents="none"
                  >
                    {rank}
                  </text>
                )}
                {rIdx === 7 && (
                  <text
                    x={x + SQ - 9}
                    y={y + SQ - 3}
                    fontSize={9}
                    fill="rgba(255,255,255,0.4)"
                    pointerEvents="none"
                  >
                    {file}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
    </Box>
  );
}

function PiecePalette({
  onPick,
  hasSquareSelected,
  disabled,
}: {
  onPick: (p: Piece) => void;
  hasSquareSelected: boolean;
  disabled: boolean;
}) {
  const white: Piece[] = ["K", "Q", "R", "B", "N", "P"];
  const black: Piece[] = ["k", "q", "r", "b", "n", "p"];
  return (
    <Box
      p={3}
      borderWidth="1px"
      borderColor="rgba(0,240,255,0.35)"
      bg="rgba(10,11,14,0.55)"
      className="sys-clip-panel-sm"
    >
      <SystemLabel accent="cyan">Piece Palette</SystemLabel>
      <Text fontSize="xs" color="textMuted" mt={1.5}>
        {disabled
          ? "Available during recall phase."
          : hasSquareSelected
            ? "Choose a piece to drop on the highlighted square."
            : "Select a square first."}
      </Text>
      <VStack align="stretch" gap={2} mt={3}>
        <HStack gap={2}>
          {white.map((p) => (
            <PieceBtn key={p} piece={p} onPick={onPick} disabled={disabled || !hasSquareSelected} />
          ))}
        </HStack>
        <HStack gap={2}>
          {black.map((p) => (
            <PieceBtn key={p} piece={p} onPick={onPick} disabled={disabled || !hasSquareSelected} />
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}

function PieceBtn({
  piece,
  onPick,
  disabled,
}: {
  piece: Piece;
  onPick: (p: Piece) => void;
  disabled: boolean;
}) {
  return (
    <Box
      as="button"
      onClick={() => !disabled && onPick(piece)}
      w="36px"
      h="36px"
      bg="rgba(0,240,255,0.06)"
      borderWidth="1px"
      borderColor={disabled ? "whiteAlpha.200" : "rgba(0,240,255,0.35)"}
      _hover={!disabled ? { borderColor: "sys.cyan", bg: "rgba(0,240,255,0.14)" } : undefined}
      transition="all 0.15s"
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.4 : 1}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text
        fontSize="2xl"
        color={piece === piece.toUpperCase() ? "#f0f2f8" : "#a8b0c4"}
        lineHeight="1"
      >
        {PIECE_GLYPH[piece]}
      </Text>
    </Box>
  );
}
