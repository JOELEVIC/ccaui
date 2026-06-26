"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { Chess } from "chess.js";
import { LessonBoard } from "./LessonBoard";
import {
  playNarration,
  cancelSpeech,
  isMuted,
  setMuted,
  getVoice,
  setVoice,
  LEARN_VOICES,
  DEFAULT_VOICE,
} from "@/lib/learn/speak";
import type { Lesson, LessonStep } from "@/lib/learn/types";

const PIECE_NAME: Record<string, string> = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };

/** Expand a FEN board field to a square→piece map. */
function expandBoard(fen: string): Record<string, string> {
  const rows = (fen.split(" ")[0] ?? "").split("/");
  const files = "abcdefgh";
  const map: Record<string, string> = {};
  for (let r = 0; r < 8; r++) {
    const rank = 8 - r;
    let f = 0;
    for (const ch of rows[r] ?? "") {
      if (/\d/.test(ch)) f += parseInt(ch, 10);
      else map[files[f++] + rank] = ch;
    }
  }
  return map;
}

/** The from/to squares of the move between two positions (for a last-move highlight). */
function diffMove(fromFen: string, toFen: string): { from: string; to: string } | null {
  const a = expandBoard(fromFen);
  const b = expandBoard(toFen);
  let from: string | null = null;
  let to: string | null = null;
  const squares = Array.from(new Set(Object.keys(a).concat(Object.keys(b))));
  for (const sq of squares) {
    if (a[sq] && !b[sq]) from = sq;
    else if (!a[sq] && b[sq]) to = sq;
    else if (a[sq] && b[sq] && a[sq] !== b[sq]) to = sq;
  }
  return from && to ? { from, to } : null;
}

/** Is `square` attacked by `attacker` in the given position? (piece sitting there ⇒ it's hanging.) */
function landsAttacked(fen: string, square: string, attacker: "w" | "b"): boolean {
  const parts = fen.split(" ");
  parts[1] = attacker;
  parts[3] = "-";
  const p = new Chess();
  try {
    p.load(parts.join(" "), { skipValidation: true });
  } catch {
    return false;
  }
  return p.moves({ verbose: true }).some((m) => m.to === square);
}

export function LessonRunner({
  lesson,
  next,
  onComplete,
}: {
  lesson: Lesson;
  next?: { id: string; title: string } | null;
  onComplete: () => void;
}) {
  const [i, setI] = useState(0);
  const [fen, setFen] = useState(lesson.steps[0]?.board ?? "8/8/8/8/8/8/8/8 w - - 0 1");
  const [flash, setFlash] = useState<{ square: string; tone: "good" | "bad" } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [captures, setCaptures] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [voice, setVoiceState] = useState(DEFAULT_VOICE);
  const [animating, setAnimating] = useState(false);
  const completedRef = useRef(false);

  const step: LessonStep | undefined = lesson.steps[i];

  useEffect(() => {
    setMutedState(isMuted());
    setVoiceState(getVoice());
  }, []);

  // On entering each step: reset the board/UI and narrate. When the step has an
  // `animateFrom`, first show that position then slide to `board` so the learner
  // sees the move replay (e.g. the pawn's two-square dash) before they act.
  useEffect(() => {
    if (!step) return;
    setFlash(null);
    setHint(null);
    setCaptures(0);
    setLastMove(null);
    if (step.animateFrom && step.board) {
      setAnimating(true);
      setFen(step.animateFrom);
      const target = step.board;
      const mv = diffMove(step.animateFrom, target);
      const t = window.setTimeout(() => {
        setFen(target);
        if (mv) setLastMove(mv);
        setAnimating(false);
      }, 700);
      playNarration(step.say ?? step.text);
      return () => {
        window.clearTimeout(t);
        cancelSpeech();
      };
    }
    setAnimating(false);
    setFen((prev) => step.board ?? prev);
    playNarration(step.say ?? step.text);
    return () => cancelSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, lesson.id]);

  const flashSoon = useCallback((sq: string, tone: "good" | "bad") => {
    setFlash({ square: sq, tone });
    window.setTimeout(() => setFlash(null), 600);
  }, []);

  const finishStep = useCallback(() => {
    window.setTimeout(() => {
      if (i >= lesson.steps.length - 1) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
        setDone(true);
      } else {
        setI((x) => x + 1);
      }
    }, 750);
  }, [i, lesson.steps.length, onComplete]);

  const advanceSay = useCallback(() => {
    cancelSpeech();
    if (i >= lesson.steps.length - 1) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
      setDone(true);
    } else {
      setI((x) => x + 1);
    }
  }, [i, lesson.steps.length, onComplete]);

  const handleMove = useCallback(
    (from: string, to: string): boolean => {
      if (!step || step.kind !== "do" || done) return false;
      const probe = new Chess();
      try {
        probe.load(fen, { skipValidation: true });
      } catch {
        return false;
      }
      let mv;
      try {
        mv = probe.move({ from, to, promotion: "q" });
      } catch {
        return false;
      }
      if (!mv) return false;
      // Single-colour lessons: keep the same side to move so the learner can make
      // consecutive moves (e.g. march a pawn e2→e4→e5). Clear any stale en passant.
      const parts = probe.fen().split(" ");
      parts[1] = mv.color;
      parts[3] = "-";
      const newFen = parts.join(" ");
      const uci = from + to + (mv.promotion ?? "");
      const goal = step.goal;

      const accept = (solved: boolean) => {
        setFen(newFen);
        setLastMove({ from, to });
        setHint(null);
        flashSoon(to, "good");
        if (solved) finishStep();
        return true;
      };
      const reject = (hanging: boolean) => {
        flashSoon(to, "bad");
        setHint(
          hanging
            ? `That square is under fire — your ${PIECE_NAME[mv.piece] ?? "piece"} would hang there. ${step.hint ?? ""}`.trim()
            : step.hint ?? "Not quite — try again.",
        );
        return false; // snap back
      };

      switch (goal.type) {
        case "move": {
          const hit = goal.uci.some((u) => u === uci || u.slice(0, 4) === from + to);
          if (hit) return accept(true);
          const hang = !!step.hangingHints && landsAttacked(newFen, to, mv.color === "w" ? "b" : "w");
          return reject(hang);
        }
        case "promote":
          return accept(!!mv.promotion);
        case "reach":
          return accept(to === goal.square);
        case "capture": {
          const target = goal.count ?? 1;
          const n = captures + (mv.captured ? 1 : 0);
          setCaptures(n);
          return accept(n >= target);
        }
        default:
          return false;
      }
    },
    [step, fen, done, captures, flashSoon, finishStep],
  );

  const toggleMute = () => {
    const m = !muted;
    setMutedState(m);
    setMuted(m);
    if (!m && step) playNarration(step.say ?? step.text);
  };

  const orientation = (step?.kind !== undefined && "orientation" in step ? step.orientation : undefined) ?? "white";
  const spotlight = step && "spotlight" in step ? step.spotlight ?? [] : [];
  const interactive = !!step && step.kind === "do" && !done && !animating;
  const stepNo = Math.min(i + 1, lesson.steps.length);

  return (
    <VStack align="stretch" gap={5} maxW="1000px" mx="auto">
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <HStack gap={3} minW={0}>
          <Link href="/learn">
            <Button size="sm" variant="outline" borderColor="blackAlpha.300" color="textPrimary" borderRadius="soft"
              _hover={{ borderColor: "gold", color: "gold" }}>
              ← Map
            </Button>
          </Link>
          <Box minW={0}>
            <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="lg" color="textPrimary" lineClamp={1}>
              {lesson.icon} {lesson.title}
            </Text>
            <Text fontSize="2xs" color="textMuted" letterSpacing="0.1em" textTransform="uppercase">
              Step {stepNo} of {lesson.steps.length}
            </Text>
          </Box>
        </HStack>
        <HStack gap={2}>
          <select
            value={voice}
            onChange={(e) => {
              const v = e.target.value;
              setVoiceState(v);
              setVoice(v);
              if (!muted && step) playNarration(step.say ?? step.text);
            }}
            title="Narration voice"
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "1px solid rgba(0,0,0,0.2)",
              color: "var(--lux-text-secondary)",
              cursor: "pointer",
            }}
          >
            {LEARN_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                🎙 {v.label}
              </option>
            ))}
          </select>
          <Button size="xs" variant="outline" borderColor="blackAlpha.300" color="textSecondary" borderRadius="soft"
            onClick={() => step && playNarration(step.say ?? step.text)} title="Replay narration">
            ▶ Replay
          </Button>
          <Button size="xs" variant="outline" borderColor="blackAlpha.300" color="textSecondary" borderRadius="soft"
            onClick={toggleMute}>
            {muted ? "🔇 Sound off" : "🔊 Sound on"}
          </Button>
        </HStack>
      </HStack>

      {/* progress dots */}
      <HStack gap={1.5}>
        {lesson.steps.map((_, k) => (
          <Box key={k} h="4px" flex={1} borderRadius="full" bg={k < i ? "gold" : k === i ? "goldDark" : "blackAlpha.200"} />
        ))}
      </HStack>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "minmax(0, 1fr) minmax(0, 360px)" }} gap={6} alignItems="start">
        <LessonBoard
          fen={fen}
          orientation={orientation}
          interactive={interactive}
          onMove={handleMove}
          spotlight={spotlight}
          flash={flash}
          lastMove={lastMove}
        />

        <VStack align="stretch" gap={4}>
          {done ? (
            <Box p={5} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="gold">
              <Text fontSize="2xs" color="gold" letterSpacing="0.14em" textTransform="uppercase" mb={1}>
                Lesson complete
              </Text>
              <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="xl" color="textPrimary" mb={3}>
                Nicely done ✓
              </Text>
              {lesson.tip && (
                <Box p={3} borderRadius="md" bg="bgWarm" borderWidth="1px" borderColor="blackAlpha.200" mb={4}>
                  <Text fontSize="2xs" color="textMuted" letterSpacing="0.1em" textTransform="uppercase" mb={1}>
                    Remember
                  </Text>
                  <Text fontSize="sm" color="textPrimary" lineHeight="1.55">{lesson.tip}</Text>
                </Box>
              )}
              <VStack align="stretch" gap={2}>
                {next ? (
                  <Link href={`/learn/lesson/${next.id}`}>
                    <Button w="full" bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                      Next: {next.title} →
                    </Button>
                  </Link>
                ) : (
                  <Link href="/learn">
                    <Button w="full" bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                      Back to the map
                    </Button>
                  </Link>
                )}
                <Link href="/learn">
                  <Button w="full" variant="outline" borderColor="blackAlpha.300" color="textPrimary" borderRadius="soft"
                    _hover={{ borderColor: "gold", color: "gold" }}>
                    Return to map
                  </Button>
                </Link>
              </VStack>
            </Box>
          ) : (
            <Box p={5} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="blackAlpha.200">
              <Text fontSize="md" color="textPrimary" lineHeight="1.65">{step?.text}</Text>

              {hint && (
                <Box mt={3} p={3} borderRadius="md" bg="rgba(220,80,80,0.08)" borderWidth="1px" borderColor="rgba(220,80,80,0.3)">
                  <Text fontSize="sm" color="statusWarning" lineHeight="1.5">💡 {hint}</Text>
                </Box>
              )}

              {step?.kind === "say" ? (
                <Button mt={4} w="full" bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }} onClick={advanceSay}>
                  Continue →
                </Button>
              ) : (
                <Text mt={4} fontSize="xs" color="textMuted" letterSpacing="0.08em" textTransform="uppercase">
                  ● Your move — drag or tap a piece
                </Text>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}
