"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Chess } from "chess.js";
import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { toaster } from "@/lib/toaster";
import { GameBoard } from "@/components/chess/GameBoard";
import { fadeInUp } from "@/lib/animations";

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
    const chess = new Chess(puzzle.fen);
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
      toaster.create({ title: "Not the best move. Try again.", type: "error" });
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

  if (loading || !puzzle) {
    return (
      <Box>
        <Text color="gold">Loading puzzle…</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <HStack gap={2} fontSize="sm" color="textMuted">
        <Link href="/dashboard">
          <Text _hover={{ color: "gold" }}>Dashboard</Text>
        </Link>
        <Text>/</Text>
        <Link href="/learning">
          <Text _hover={{ color: "gold" }}>Learning</Text>
        </Link>
        <Text>/</Text>
        <Text color="gold">Puzzle #{puzzle.id.slice(-4)}</Text>
      </HStack>

      <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="xl" color="gold" fontFamily="var(--font-playfair), Georgia, serif" fontWeight="600">
            Find the best move
          </Heading>
          <HStack gap={3} mt={2} flexWrap="wrap">
            <Text color="textSecondary" fontSize="sm">
              Difficulty: {puzzle.difficulty}
            </Text>
            {puzzle.theme?.length > 0 && (
              <>
                <Text color="textMuted" fontSize="sm">·</Text>
                <Text color="textSecondary" fontSize="sm">
                  Theme: {puzzle.theme.join(", ")}
                </Text>
              </>
            )}
            <Text color="textMuted" fontSize="sm">·</Text>
            <Text color="textSecondary" fontSize="sm">
              {orientation === "white" ? "White" : "Black"} to play
            </Text>
          </HStack>
        </Box>
        <Link href="/learning">
          <Button size="sm" variant="ghost" color="textMuted" borderRadius="soft">
            ← Back to learning
          </Button>
        </Link>
      </HStack>

      {solved ? (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Box
            p={6}
            bg="bgCard"
            borderRadius="soft"
            borderWidth="1px"
            borderColor="cameroonGreen"
            textAlign="center"
          >
            <Text fontSize="3xl" fontWeight="700" color="cameroonGreen" fontFamily="var(--font-playfair), Georgia, serif">
              Solved!
            </Text>
            {reward && (reward.xp > 0 || reward.streak > 0) && (
              <Text color="textSecondary" mt={2}>
                +{reward.xp} XP {reward.streak > 0 ? `· ${reward.streak}-puzzle streak` : ""}
              </Text>
            )}
            <HStack mt={4} gap={3} justify="center" flexWrap="wrap">
              <Button bg="gold" color="bgDark" borderRadius="soft" onClick={goNext} _hover={{ bg: "goldLight" }}>
                Next puzzle →
              </Button>
              <Link href="/learning">
                <Button variant="outline" borderColor="gold" color="gold" borderRadius="soft">
                  Back to learning
                </Button>
              </Link>
              <Link href="/road-to-master">
                <Button variant="ghost" color="textMuted" borderRadius="soft">
                  Road to Master
                </Button>
              </Link>
            </HStack>
          </Box>
        </motion.div>
      ) : (
        <>
          <GameBoard
            fen={currentFen}
            orientation={orientation}
            isMyTurn={true}
            onMove={handleMove}
            allowMove={!solved}
          />
          <HStack gap={3} fontSize="sm">
            <Text color="textMuted">Moves played:</Text>
            <Text color="textSecondary">{moves.join(" ") || "—"}</Text>
          </HStack>
        </>
      )}
    </VStack>
  );
}
