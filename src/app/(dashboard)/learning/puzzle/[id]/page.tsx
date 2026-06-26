"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Chess } from "chess.js";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { toaster } from "@/lib/toaster";
import { LessonBoard } from "@/components/learn/LessonBoard";

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

/** UCI from a from/to pair, validated against the FEN; auto-queens promotions. */
function buildUci(fen: string, from: string, to: string): string | null {
  try {
    const c = new Chess(fen);
    const move = c.move({ from, to, promotion: "q" });
    if (!move) return null;
    return `${move.from}${move.to}${move.promotion ? move.promotion.toLowerCase() : ""}`;
  } catch {
    return null;
  }
}

export default function PuzzlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [moves, setMoves] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [reward, setReward] = useState<{ xp: number; streak: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<{ square: string; tone: "good" | "bad" } | null>(null);

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
    if (!puzzle) return "8/8/8/8/8/8/8/8 w - - 0 1";
    let chess: Chess;
    try {
      chess = new Chess(puzzle.fen);
    } catch {
      return "8/8/8/8/8/8/8/8 w - - 0 1";
    }
    for (const m of moves) {
      try {
        if (m.length >= 4) chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: "q" });
        else chess.move(m);
      } catch {
        break;
      }
    }
    return chess.fen();
  }, [puzzle, moves]);

  const orientation: "white" | "black" = useMemo(
    () => (puzzle && puzzle.fen.split(" ")[1] === "b" ? "black" : "white"),
    [puzzle],
  );

  const turn: "white" | "black" = useMemo(() => {
    try {
      return new Chess(currentFen).turn() === "w" ? "white" : "black";
    } catch {
      return "white";
    }
  }, [currentFen]);

  const lastMove = useMemo(() => {
    const m = moves[moves.length - 1];
    return m && m.length >= 4 ? { from: m.slice(0, 2), to: m.slice(2, 4) } : null;
  }, [moves]);

  const solutionLen = useMemo(
    () => puzzle?.solution?.trim().split(/\s+/).filter(Boolean).length ?? 0,
    [puzzle?.solution],
  );

  const flashSoon = (square: string, tone: "good" | "bad") => {
    setFlash({ square, tone });
    window.setTimeout(() => setFlash(null), 550);
  };

  const onBoardMove = (from: string, to: string): boolean => {
    if (solved || !puzzle) return false;
    const uci = buildUci(currentFen, from, to);
    if (!uci) return false;
    const solutionMoves = puzzle.solution.trim().split(/\s+/);
    const next = [...moves, uci];
    const correctSoFar = next.join(" ") === solutionMoves.slice(0, next.length).join(" ");
    if (!correctSoFar) {
      setMisses((m) => m + 1);
      flashSoon(to, "bad");
      toaster.create({ title: "Not the best move — try again.", type: "error" });
      return false;
    }
    setMoves(next);
    flashSoon(to, "good");
    if (next.length === solutionMoves.length) {
      checkSolution({ variables: { puzzleId: id, solution: next.join(" ") } }).then(({ data: res }) => {
        const result = res?.checkPuzzleSolution;
        if (result?.correct) {
          setSolved(true);
          setReward({ xp: result.xpAwarded ?? 0, streak: result.streakAfter ?? 0 });
          toaster.create({
            title: (result.streakAfter ?? 0) > 0 ? `Solved! · Streak ${result.streakAfter}` : "Solved!",
            type: "success",
          });
        }
      });
    }
    return true;
  };

  const goNext = () => {
    const next = (nextData?.puzzles ?? []).find((p) => p.id !== id);
    router.push(next ? `/learning/puzzle/${next.id}` : "/learning");
  };

  const resetAttempt = () => {
    setMoves([]);
    setMisses(0);
    setFlash(null);
  };

  if (loading || !puzzle) {
    return (
      <Box py={16}>
        <Text color="textMuted" textAlign="center">Loading puzzle…</Text>
      </Box>
    );
  }

  return (
    <Box py={2}>
      <VStack align="stretch" gap={5} maxW="1040px" mx="auto">
        {/* Header */}
        <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
          <HStack gap={3} align="center" minW={0}>
            <Link href="/learning">
              <Button size="sm" variant="outline" borderColor="blackAlpha.300" color="textPrimary" borderRadius="soft" _hover={{ borderColor: "gold", color: "gold" }}>
                ← Learn
              </Button>
            </Link>
            <Box w="44px" h="44px" borderRadius="12px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" fontSize="22px" color="white" bg="gold">
              ♟
            </Box>
            <Box minW={0}>
              <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="xl" color="textPrimary" lineHeight="1.1">
                Find the best move
              </Text>
              <HStack gap={2} mt={1} flexWrap="wrap">
                <Pill label="Elo" value={String(puzzle.difficulty)} />
                <Pill label="Solution" value={`${solutionLen} ply`} />
                {puzzle.theme?.slice(0, 3).map((t) => (
                  <Text key={t} fontSize="2xs" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
                    px={2} py={0.5} borderRadius="full" bg="rgba(212,175,55,0.12)" color="goldDark">
                    {t.replace(/_/g, " ")}
                  </Text>
                ))}
              </HStack>
            </Box>
          </HStack>
        </HStack>

        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "minmax(0, 1fr) minmax(0, 340px)" }} gap={6} alignItems="start">
          {/* Board */}
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" px={1}>
              <Text fontSize="2xs" color="textMuted" letterSpacing="0.14em" textTransform="uppercase">
                {puzzle.theme?.length ? puzzle.theme.join(" · ") : "Single position"}
              </Text>
              <HStack gap={1.5}>
                <Box w="10px" h="10px" borderRadius="full" bg={turn === "white" ? "white" : "#2b2b2b"} borderWidth="1px" borderColor="blackAlpha.400" />
                <Text fontSize="2xs" color="textSecondary" letterSpacing="0.1em" textTransform="uppercase">{turn} to move</Text>
              </HStack>
            </HStack>
            <LessonBoard
              fen={currentFen}
              orientation={orientation}
              interactive={!solved}
              onMove={onBoardMove}
              flash={flash}
              lastMove={lastMove}
            />
          </VStack>

          {/* Right rail */}
          <VStack align="stretch" gap={4}>
            <Box p={4} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="blackAlpha.200">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase">Progress</Text>
                <Text fontSize="sm" fontWeight="800" color="gold">{moves.length} / {solutionLen} ply</Text>
              </HStack>
              <Box h="6px" borderRadius="full" bg="blackAlpha.200" overflow="hidden">
                <Box h="full" bg="gold" w={`${solutionLen > 0 ? Math.min(100, (moves.length / solutionLen) * 100) : 0}%`} transition="width 0.3s ease-out" />
              </Box>
              <HStack justify="space-between" mt={3}>
                <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase">Misses</Text>
                <Text fontSize="sm" fontWeight="800" color={misses === 0 ? "textPrimary" : misses < 3 ? "goldDark" : "statusWarning"}>
                  {misses}
                </Text>
              </HStack>
            </Box>

            <Box p={4} borderRadius="soft" bg="bgWarm" borderWidth="1px" borderColor="blackAlpha.200">
              <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase" mb={2}>Your moves</Text>
              <Text fontSize="sm" color="textPrimary" fontFamily="var(--font-inter), sans-serif" minH="22px">
                {moves.length > 0 ? moves.join("  ") : <Box as="span" color="textMuted">— make your move on the board</Box>}
              </Text>
            </Box>

            <VStack align="stretch" gap={2}>
              <Button onClick={resetAttempt} bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }}>↻ Reset</Button>
              <Button onClick={goNext} variant="outline" borderColor="blackAlpha.300" color="textPrimary" borderRadius="soft" _hover={{ borderColor: "gold", color: "gold" }}>↷ Skip</Button>
              <Link href="/learning"><Button w="full" variant="ghost" color="textSecondary" borderRadius="soft" _hover={{ color: "gold" }}>← Back to Learn</Button></Link>
            </VStack>
          </VStack>
        </Box>
      </VStack>

      <AnimatePresence>
        {solved && <SolvedOverlay reward={reward} onNext={goNext} onClose={() => setSolved(false)} />}
      </AnimatePresence>
    </Box>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <HStack gap={1.5} px={2.5} py={1} borderRadius="full" borderWidth="1px" borderColor="blackAlpha.200" bg="bgCard">
      <Text fontSize="2xs" color="textMuted" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase">{label}</Text>
      <Text fontSize="xs" color="textPrimary" fontWeight="800">{value}</Text>
    </HStack>
  );
}

function SolvedOverlay({ reward, onNext, onClose }: { reward: { xp: number; streak: number } | null; onNext: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(26,37,48,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <motion.div initial={{ scale: 0.92, y: 8 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} style={{ maxWidth: 460, width: "100%" }}>
        <Box bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="gold" p={{ base: 6, md: 8 }} textAlign="center" boxShadow="0 24px 60px -24px rgba(26,37,48,0.4)">
          <Box w="76px" h="76px" mx="auto" mb={3} borderRadius="full" bg="rgba(212,175,55,0.14)" display="flex" alignItems="center" justifyContent="center" fontSize="40px" color="gold">
            ✓
          </Box>
          <Text fontSize="2xs" color="gold" letterSpacing="0.18em" textTransform="uppercase" mb={1}>Puzzle solved</Text>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="3xl" color="textPrimary" lineHeight="1">Well played!</Text>
          {reward && (reward.streak > 0 || reward.xp > 0) && (
            <HStack gap={3} justify="center" mt={4}>
              {reward.streak > 0 && (
                <Box px={4} py={2} borderRadius="md" bg="bgWarm" borderWidth="1px" borderColor="blackAlpha.200">
                  <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase">Streak</Text>
                  <Text fontSize="lg" fontWeight="800" color="textPrimary">{reward.streak} 🔥</Text>
                </Box>
              )}
              {reward.xp > 0 && (
                <Box px={4} py={2} borderRadius="md" bg="bgWarm" borderWidth="1px" borderColor="blackAlpha.200">
                  <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase">XP</Text>
                  <Text fontSize="lg" fontWeight="800" color="textPrimary">+{reward.xp}</Text>
                </Box>
              )}
            </HStack>
          )}
          <VStack gap={2} mt={6} align="stretch">
            <Button onClick={onNext} bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }}>Next puzzle →</Button>
            <HStack gap={2}>
              <Button flex={1} onClick={onClose} variant="outline" borderColor="blackAlpha.300" color="textPrimary" borderRadius="soft" _hover={{ borderColor: "gold", color: "gold" }}>Review</Button>
              <Link href="/road-to-master" style={{ flex: 1 }}><Button w="full" variant="ghost" color="textSecondary" borderRadius="soft" _hover={{ color: "gold" }}>Road to Master</Button></Link>
            </HStack>
          </VStack>
        </Box>
      </motion.div>
    </motion.div>
  );
}
