"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

/**
 * "Board Memory" — a flash-and-rebuild recall game. A position lights up for a
 * few seconds, then vanishes; you tap the squares that held a piece. Correct
 * taps glow green, misses show in gold. Levels add pieces and shave time.
 *
 * Pure client-side, no login — a genuinely novel "I didn't know chess could
 * feel like this" moment for a first-time visitor.
 */

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const POOL = ["wN", "wB", "wR", "wQ", "wP", "bN", "bB", "bR", "bQ", "bP"];
const EMPTY_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

type Phase = "idle" | "study" | "recall" | "result";

function squareFromIndex(i: number): string {
  // i: 0 = a8 … 63 = h1
  const file = i % 8;
  const rank = 8 - Math.floor(i / 8);
  return `${FILES[file]}${rank}`;
}

function levelConfig(level: number) {
  return {
    pieces: Math.min(3 + level, 12),
    studyMs: Math.max(2500, 6000 - (level - 1) * 500),
  };
}

/** Random placements: { square: "wN" }. */
function makePlacements(count: number): Record<string, string> {
  const idx = Array.from({ length: 64 }, (_, i) => i);
  // Fisher–Yates-ish shuffle (Math.random is fine here — purely cosmetic).
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const out: Record<string, string> = {};
  for (let n = 0; n < count; n++) {
    out[squareFromIndex(idx[n])] = POOL[Math.floor(Math.random() * POOL.length)];
  }
  return out;
}

function buildFen(placements: Record<string, string>): string {
  const ranks: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row = "";
    let empty = 0;
    for (const f of FILES) {
      const sq = `${f}${rank}`;
      const code = placements[sq];
      if (!code) {
        empty++;
      } else {
        if (empty) {
          row += empty;
          empty = 0;
        }
        const type = code[1];
        row += code[0] === "w" ? type.toUpperCase() : type.toLowerCase();
      }
    }
    if (empty) row += empty;
    ranks.push(row);
  }
  return `${ranks.join("/")} w - - 0 1`;
}

export function MemoryGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [guesses, setGuesses] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cfg = useMemo(() => levelConfig(level), [level]);
  const targetSquares = useMemo(() => Object.keys(placements), [placements]);

  const startLevel = useCallback((lvl: number) => {
    const { pieces, studyMs } = levelConfig(lvl);
    setLevel(lvl);
    setPlacements(makePlacements(pieces));
    setGuesses(new Set());
    setTimeLeft(studyMs);
    setPhase("study");
  }, []);

  // Study countdown.
  useEffect(() => {
    if (phase !== "study") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase("recall");
          return 0;
        }
        return t - 100;
      });
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (phase !== "recall") return;
      setGuesses((prev) => {
        const next = new Set(prev);
        if (next.has(square)) next.delete(square);
        else next.add(square);
        return next;
      });
    },
    [phase]
  );

  const stats = useMemo(() => {
    const target = new Set(targetSquares);
    let correct = 0;
    guesses.forEach((g) => target.has(g) && correct++);
    const wrong = guesses.size - correct;
    const missed = target.size - correct;
    const perfect = wrong === 0 && missed === 0 && target.size > 0;
    return { correct, wrong, missed, total: target.size, perfect };
  }, [guesses, targetSquares]);

  const reveal = useCallback(() => {
    setPhase("result");
    if (stats.perfect) {
      const ns = streak + 1;
      setStreak(ns);
      setBest((b) => Math.max(b, ns));
    } else {
      setStreak(0);
    }
  }, [stats.perfect, streak]);

  // Auto-reveal once they've placed as many as the target.
  useEffect(() => {
    if (phase === "recall" && guesses.size >= targetSquares.length && targetSquares.length > 0) {
      const id = setTimeout(reveal, 350);
      return () => clearTimeout(id);
    }
  }, [phase, guesses, targetSquares, reveal]);

  const position =
    phase === "study" ? buildFen(placements) : phase === "result" ? buildFen(placements) : EMPTY_FEN;

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (phase === "recall") {
      guesses.forEach((g) => {
        styles[g] = { background: "rgba(197,160,89,0.55)", borderRadius: "50%" };
      });
    } else if (phase === "result") {
      const target = new Set(targetSquares);
      guesses.forEach((g) => {
        styles[g] = target.has(g)
          ? { boxShadow: "inset 0 0 0 4px rgba(46,125,91,0.9)" }
          : { boxShadow: "inset 0 0 0 4px rgba(192,73,47,0.85)" };
      });
      target.forEach((t) => {
        if (!guesses.has(t)) styles[t] = { boxShadow: "inset 0 0 0 4px rgba(197,160,89,0.85)" };
      });
    }
    return styles;
  }, [phase, guesses, targetSquares]);

  return (
    <VStack align="stretch" gap={6} maxW="3xl" mx="auto">
      {/* Scoreboard */}
      <SimpleGrid columns={3} gap={3}>
        <Stat label="Level" value={level} />
        <Stat label="Streak" value={streak} accent />
        <Stat label="Best" value={best} />
      </SimpleGrid>

      {/* Status line */}
      <Box textAlign="center" minH="28px">
        {phase === "idle" && (
          <Text color="textSecondary" fontSize="sm">
            Memorise the pieces, then tap every square that held one.
          </Text>
        )}
        {phase === "study" && (
          <HStack justify="center" gap={3}>
            <Text color="gold" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" fontSize="sm">
              Memorise
            </Text>
            <Box w="120px" h="6px" borderRadius="full" bg="bgWarm" overflow="hidden">
              <MotionBox
                h="full"
                bg="gold"
                animate={{ width: `${(timeLeft / cfg.studyMs) * 100}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </Box>
            <Text color="textMuted" fontSize="sm" w="36px">
              {(timeLeft / 1000).toFixed(1)}s
            </Text>
          </HStack>
        )}
        {phase === "recall" && (
          <Text color="textPrimary" fontWeight="600" fontSize="sm">
            Tap the {targetSquares.length} squares · {guesses.size}/{targetSquares.length}
          </Text>
        )}
        {phase === "result" && (
          <Text color={stats.perfect ? "accentGreen" : "textPrimary"} fontWeight="700" fontSize="md">
            {stats.perfect ? "Perfect recall! ✦" : `${stats.correct}/${stats.total} correct`}
          </Text>
        )}
      </Box>

      {/* Board */}
      <Box maxW="480px" mx="auto" w="full">
        <Chessboard
          options={{
            position,
            allowDragging: false,
            onSquareClick,
            squareStyles,
            showNotation: true,
            darkSquareStyle: { backgroundColor: "#9ca3af" },
            lightSquareStyle: { backgroundColor: "#e5e7eb" },
            boardStyle: { borderRadius: 12, boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" },
          }}
        />
      </Box>

      {/* Controls */}
      <HStack justify="center" gap={3} flexWrap="wrap">
        {phase === "idle" && (
          <PrimaryBtn onClick={() => startLevel(1)}>Start</PrimaryBtn>
        )}
        {phase === "recall" && (
          <>
            <PrimaryBtn onClick={reveal}>Check</PrimaryBtn>
            <GhostBtn onClick={() => setGuesses(new Set())}>Clear</GhostBtn>
          </>
        )}
        {phase === "result" && (
          <>
            {stats.perfect ? (
              <PrimaryBtn onClick={() => startLevel(level + 1)}>Next level →</PrimaryBtn>
            ) : (
              <PrimaryBtn onClick={() => startLevel(level)}>Try again</PrimaryBtn>
            )}
            <GhostBtn onClick={() => startLevel(1)}>Restart</GhostBtn>
          </>
        )}
      </HStack>
    </VStack>
  );
}

/* ── small bits ── */

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Box bg="bgCard" borderWidth="1px" borderColor="blackAlpha.200" borderRadius="soft" px={4} py={3} textAlign="center">
      <Text fontSize="2xs" color="textMuted" letterSpacing="0.16em" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="700" color={accent ? "gold" : "textPrimary"} fontFamily="var(--font-playfair), Georgia, serif">
        {value}
      </Text>
    </Box>
  );
}

function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button onClick={onClick} bg="gold" color="white" borderRadius="soft" fontWeight="600" px={6} _hover={{ bg: "goldLight" }} _active={{ transform: "scale(0.97)" }} transition="all 0.15s">
      {children}
    </Button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="outline" borderColor="blackAlpha.300" color="textSecondary" borderRadius="soft" _hover={{ borderColor: "gold", color: "gold" }} _active={{ transform: "scale(0.97)" }} transition="all 0.15s">
      {children}
    </Button>
  );
}
