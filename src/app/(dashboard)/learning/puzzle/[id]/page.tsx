"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Chess } from "chess.js";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { toaster } from "@/lib/toaster";
import { GameBoard } from "@/components/chess/GameBoard";
import { SystemBoardFrame } from "@/components/system/SystemBoardFrame";
import {
  SystemPanel,
  SystemButton,
  SystemLabel,
  SYSTEM_KEYFRAMES,
} from "@/components/system/SystemPrimitives";
import { ManaBurst } from "@/components/system/ManaBeam";

const PUZZLE = gql`
  query PuzzleDetail($id: ID!) {
    puzzle(id: $id) {
      id
      fen
      solution
      difficulty
      theme
    }
  }
`;

const NEXT_PUZZLE = gql`
  query NextPuzzle($difficulty: Int) {
    puzzles(difficulty: $difficulty) {
      id
    }
  }
`;

const CHECK_SOLUTION = gql`
  mutation CheckPuzzleSolution($puzzleId: ID!, $solution: String!) {
    checkPuzzleSolution(puzzleId: $puzzleId, solution: $solution) {
      correct
      solution
      xpAwarded
      streakAfter
    }
  }
`;

export default function PuzzlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [moves, setMoves] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [reward, setReward] = useState<{ xp: number; streak: number } | null>(null);
  const [misses, setMisses] = useState(0);

  const { data, loading } = useQuery<{
    puzzle: { id: string; fen: string; solution: string; difficulty: number; theme: string[] };
  }>(PUZZLE, { variables: { id } });

  const { data: nextData } = useQuery<{ puzzles: Array<{ id: string }> }>(NEXT_PUZZLE, {
    variables: { difficulty: data?.puzzle?.difficulty },
    skip: !data?.puzzle?.difficulty,
  });

  const [checkSolution] = useMutation<{
    checkPuzzleSolution: { correct: boolean; solution: string; xpAwarded?: number | null; streakAfter?: number | null };
  }>(CHECK_SOLUTION);

  const puzzle = data?.puzzle;

  const currentFen = useMemo(() => {
    if (!puzzle) return "start";
    let chess: Chess;
    try {
      chess = new Chess(puzzle.fen);
    } catch {
      return "start";
    }
    for (const m of moves) {
      try {
        if (m.length >= 4) {
          chess.move({ from: m.slice(0, 2), to: m.slice(2, 4) });
        } else {
          chess.move(m);
        }
      } catch {
        break;
      }
    }
    return chess.fen();
  }, [puzzle, moves]);

  const orientation: "white" | "black" = useMemo(() => {
    if (!puzzle) return "white";
    return puzzle.fen.split(" ")[1] === "w" ? "white" : "black";
  }, [puzzle]);

  const turn: "white" | "black" = useMemo(() => {
    try {
      const c = new Chess(currentFen);
      return c.turn() === "w" ? "white" : "black";
    } catch {
      return "white";
    }
  }, [currentFen]);

  const solutionLen = useMemo(
    () => (puzzle?.solution?.trim().split(/\s+/).filter(Boolean).length ?? 0),
    [puzzle?.solution]
  );

  const handleMove = (move: string) => {
    const next = [...moves, move];
    setMoves(next);
    const solutionMoves = puzzle?.solution?.trim().split(/\s+/) ?? [];
    const attempt = next.join(" ");
    if (attempt === solutionMoves.slice(0, next.length).join(" ")) {
      if (next.length === solutionMoves.length) {
        checkSolution({
          variables: { puzzleId: id, solution: attempt },
        }).then(({ data: res }) => {
          const result = res?.checkPuzzleSolution;
          if (result?.correct) {
            setSolved(true);
            const xp = result.xpAwarded ?? 0;
            const streak = result.streakAfter ?? 0;
            setReward({ xp, streak });
            const msg = xp > 0 || streak > 0
              ? `Correct! +${xp} XP${streak > 0 ? ` · Streak: ${streak}` : ""}`
              : "Correct! Puzzle solved.";
            toaster.create({ title: msg, type: "success" });
          }
        });
      }
    } else {
      setMisses((m) => m + 1);
      toaster.create({ title: "Not the best move.", type: "error" });
      setMoves(moves);
    }
  };

  const goNext = () => {
    const all = nextData?.puzzles ?? [];
    const next = all.find((p) => p.id !== id);
    if (next) {
      router.push(`/learning/puzzle/${next.id}`);
    } else {
      router.push("/learning");
    }
  };

  const resetAttempt = () => {
    setMoves([]);
    setMisses(0);
  };

  if (loading || !puzzle) {
    return (
      <Box bg="sys.void" minH="100vh" mx={{ base: -3, md: -6 }} px={{ base: 3, md: 6 }} py={10}>
        <Text color="sys.cyan" textAlign="center">[ System ] · syncing position…</Text>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      bg="sys.void"
      minH="100vh"
      mx={{ base: -3, md: -6 }}
      px={{ base: 3, md: 6 }}
      pt={{ base: 2, md: 4 }}
      pb={10}
      color="textPrimary"
    >
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <Backdrop />

      <Box position="relative" zIndex={1} maxW="1180px" mx="auto">
        {/* Breadcrumb */}
        <HStack gap={2} fontSize="xs" color="textMuted" mb={3} fontFamily="var(--font-oswald), var(--font-inter), sans-serif" letterSpacing="0.18em" textTransform="uppercase">
          <Link href="/dashboard"><Text _hover={{ color: "sys.cyan" }}>Dashboard</Text></Link>
          <Text>›</Text>
          <Link href="/learning"><Text _hover={{ color: "sys.cyan" }}>Learn</Text></Link>
          <Text>›</Text>
          <Text color="sys.cyan" style={{ textShadow: "0 0 6px var(--sys-cyan)" }}>
            Trial #{puzzle.id.slice(-4)}
          </Text>
        </HStack>

        {/* Header */}
        <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={4} mb={5}>
          <Box>
            <SystemLabel accent="cyan">[ Puzzle ]</SystemLabel>
            <Text
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={{ base: "3xl", md: "4xl" }}
              color="textPrimary"
              fontWeight="700"
              lineHeight="1.05"
              mt={1}
            >
              Find the best move
            </Text>
            <HStack gap={2} mt={2} flexWrap="wrap">
              <MetaPill label="Elo" value={String(puzzle.difficulty)} accent="cyan" />
              <MetaPill label="Solution" value={`${solutionLen} ply`} accent="purple" />
              {puzzle.theme?.slice(0, 3).map((t) => (
                <ThemeTag key={t} label={t} />
              ))}
            </HStack>
          </Box>
          <SystemButton accent="purple" emphasis="ghost" size="md" href="/learning" glyph="←">
            Learn
          </SystemButton>
        </HStack>

        {/* Board + rail */}
        <SystemBoardFrame
          accent="cyan"
          turn={turn}
          tag="◆ PUZZLE"
          topMeta={puzzle.theme?.length ? puzzle.theme.join(" · ") : "Single position"}
          rightRail={
            <RightRail
              moves={moves}
              misses={misses}
              solutionLen={solutionLen}
              onReset={resetAttempt}
              onSkip={goNext}
              onLearn={() => router.push("/learning")}
            />
          }
        >
          <GameBoard
            fen={currentFen}
            orientation={orientation}
            isMyTurn={true}
            onMove={handleMove}
            allowMove={!solved}
            variant="system"
          />
        </SystemBoardFrame>
      </Box>

      <AnimatePresence>
        {solved && (
          <SolvedOverlay reward={reward} onNext={goNext} onClose={() => setSolved(false)} />
        )}
      </AnimatePresence>
    </Box>
  );
}

/* ─────────── Right rail ─────────── */

function RightRail({
  moves,
  misses,
  solutionLen,
  onReset,
  onSkip,
  onLearn,
}: {
  moves: string[];
  misses: number;
  solutionLen: number;
  onReset: () => void;
  onSkip: () => void;
  onLearn: () => void;
}) {
  return (
    <VStack align="stretch" gap={3}>
      <SystemPanel accent="cyan" glow="soft" p={4}>
        <SystemLabel accent="cyan">Progress</SystemLabel>
        <VStack align="stretch" gap={2.5} mt={2.5}>
          <HStack justify="space-between">
            <Text fontSize="xs" color="textMuted" letterSpacing="0.18em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
              Progress
            </Text>
            <Text fontFamily="var(--font-oswald), var(--font-inter), sans-serif" fontSize="md" fontWeight="800" color="sys.cyan" style={{ textShadow: "0 0 6px var(--sys-cyan)" }}>
              {moves.length} / {solutionLen} ply
            </Text>
          </HStack>
          <Box h="3px" bg="rgba(0,240,255,0.08)" overflow="hidden" position="relative">
            <Box
              position="absolute"
              top={0}
              bottom={0}
              left={0}
              w={`${solutionLen > 0 ? Math.min(100, (moves.length / solutionLen) * 100) : 0}%`}
              bg="var(--sys-cyan)"
              style={{ boxShadow: "0 0 6px var(--sys-cyan)", transition: "width 0.3s ease-out" }}
            />
          </Box>
          <HStack justify="space-between" mt={1}>
            <Text fontSize="xs" color="textMuted" letterSpacing="0.18em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
              Misses
            </Text>
            <Text
              fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
              fontSize="md"
              fontWeight="800"
              color={misses === 0 ? "textPrimary" : misses < 3 ? "sys.epic" : "sys.threat"}
              style={misses >= 3 ? { textShadow: "0 0 6px var(--sys-threat)" } : undefined}
            >
              {misses}
            </Text>
          </HStack>
        </VStack>
      </SystemPanel>

      <SystemPanel accent="purple" glow="soft" p={4}>
        <SystemLabel accent="purple">Moves</SystemLabel>
        <Text
          mt={2}
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          fontSize="sm"
          color="textSecondary"
          letterSpacing="0.06em"
          minH="22px"
        >
          {moves.length > 0 ? moves.join(" ") : <Box as="span" color="textMuted">— no moves played</Box>}
        </Text>
      </SystemPanel>

      <VStack align="stretch" gap={2}>
        <SystemButton accent="cyan" emphasis="primary" size="lg" glyph="↻" onClick={onReset} full>
          Reset
        </SystemButton>
        <SystemButton accent="threat" emphasis="secondary" size="md" glyph="↷" onClick={onSkip} full>
          Skip
        </SystemButton>
        <SystemButton accent="purple" emphasis="ghost" size="md" glyph="←" onClick={onLearn} full>
          Back
        </SystemButton>
      </VStack>
    </VStack>
  );
}

/* ─────────── Solved overlay ─────────── */

function SolvedOverlay({
  reward,
  onNext,
  onClose,
}: {
  reward: { xp: number; streak: number } | null;
  onNext: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(2,4,10,0.86)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Box maxW="560px" w="full" style={{ animation: "system-modal-in 0.55s cubic-bezier(0.16,1,0.3,1) forwards" }}>
        <SystemPanel accent="cyan" glow="strong" brackets p={{ base: 5, md: 8 }}>
          <VStack gap={4}>
            <Box position="relative" w="120px" h="120px">
              <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
                <Box position="absolute" left={0} top={0}>
                  <ManaBurst size={120} color="var(--sys-cyan)" duration={1.1} />
                </Box>
                <Text
                  fontFamily="var(--font-playfair), Georgia, serif"
                  fontSize="6xl"
                  color="sys.cyan"
                  style={{ textShadow: "0 0 18px var(--sys-cyan), 0 0 42px rgba(0,240,255,0.55)" }}
                  zIndex={1}
                  position="relative"
                >
                  ✦
                </Text>
              </Box>
            </Box>

            <VStack gap={1} textAlign="center">
              <SystemLabel accent="cyan">[ The System ]</SystemLabel>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "3xl", md: "5xl" }}
                fontWeight="700"
                color="sys.cyan"
                lineHeight="1"
                letterSpacing="0.04em"
                style={{
                  textShadow: "0 0 14px var(--sys-cyan), 0 0 32px rgba(0,240,255,0.55)",
                  animation: "system-glitch 0.45s ease-out 1",
                }}
              >
                SOLVED
              </Text>
              <Text fontSize="sm" color="textSecondary" mt={1}>
                Position cleared.
              </Text>
            </VStack>

            {reward && (reward.xp > 0 || reward.streak > 0) && (
              <HStack gap={3} justify="center" mt={2}>
                {reward.xp > 0 && (
                  <Box px={4} py={2} borderWidth="1px" borderColor="rgba(0,240,255,0.5)" bg="rgba(0,240,255,0.08)" className="sys-clip-panel-sm">
                    <Text fontSize="2xs" color="textMuted" letterSpacing="0.22em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
                      Reward
                    </Text>
                    <Text fontFamily="var(--font-oswald), var(--font-inter), sans-serif" fontSize="xl" fontWeight="800" color="sys.cyan" style={{ textShadow: "0 0 8px var(--sys-cyan)" }}>
                      +{reward.xp} XP
                    </Text>
                  </Box>
                )}
                {reward.streak > 0 && (
                  <Box px={4} py={2} borderWidth="1px" borderColor="rgba(177,151,252,0.5)" bg="rgba(177,151,252,0.08)" className="sys-clip-panel-sm">
                    <Text fontSize="2xs" color="textMuted" letterSpacing="0.22em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
                      Streak
                    </Text>
                    <Text fontFamily="var(--font-oswald), var(--font-inter), sans-serif" fontSize="xl" fontWeight="800" color="sys.epic" style={{ textShadow: "0 0 8px var(--sys-epic)" }}>
                      {reward.streak} ✦
                    </Text>
                  </Box>
                )}
              </HStack>
            )}

            <HStack gap={3} justify="center" flexWrap="wrap" mt={3}>
              <SystemButton accent="cyan" emphasis="primary" glyph="▶" onClick={onNext}>
                Next
              </SystemButton>
              <SystemButton accent="purple" emphasis="secondary" glyph="←" onClick={onClose}>
                Review
              </SystemButton>
              <SystemButton accent="epic" emphasis="ghost" href="/road-to-master">
                Road to Master
              </SystemButton>
            </HStack>
          </VStack>
        </SystemPanel>
      </Box>
    </motion.div>
  );
}

/* ─────────── Small pills ─────────── */

function MetaPill({ label, value, accent }: { label: string; value: string; accent: "cyan" | "purple" }) {
  const c = accent === "cyan" ? "var(--sys-cyan)" : "var(--sys-purple)";
  const rgb = accent === "cyan" ? "0,240,255" : "138,43,226";
  return (
    <Box
      px={3}
      py={1.5}
      borderWidth="1px"
      borderColor={`rgba(${rgb}, 0.5)`}
      bg={`rgba(${rgb}, 0.07)`}
      className="sys-clip-panel-sm"
      style={{ boxShadow: `0 0 8px rgba(${rgb}, 0.25)` }}
    >
      <HStack gap={1.5}>
        <Text fontSize="2xs" color="textMuted" letterSpacing="0.18em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
          {label}
        </Text>
        <Text fontFamily="var(--font-oswald), var(--font-inter), sans-serif" fontWeight="800" fontSize="sm" color={c} style={{ textShadow: `0 0 4px ${c}` }}>
          {value}
        </Text>
      </HStack>
    </Box>
  );
}

function ThemeTag({ label }: { label: string }) {
  return (
    <Box
      px={2.5}
      py={1}
      bg="rgba(177,151,252,0.08)"
      borderWidth="1px"
      borderColor="rgba(177,151,252,0.4)"
      className="sys-clip-panel-sm"
    >
      <Text
        fontSize="2xs"
        color="sys.epic"
        fontWeight="700"
        letterSpacing="0.18em"
        textTransform="uppercase"
        fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
      >
        {label.replace(/_/g, " ")}
      </Text>
    </Box>
  );
}

function Backdrop() {
  return (
    <>
      <Box
        position="absolute"
        inset={0}
        background="radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(138,43,226,0.10) 0%, transparent 50%)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.04}
        backgroundImage="linear-gradient(rgba(0,240,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.6) 1px, transparent 1px)"
        backgroundSize="64px 64px"
        pointerEvents="none"
      />
    </>
  );
}
