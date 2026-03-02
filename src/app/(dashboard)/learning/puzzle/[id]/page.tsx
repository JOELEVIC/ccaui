"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Chess } from "chess.js";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { GameBoard } from "@/components/chess/GameBoard";

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
  const id = params.id as string;
  const [moves, setMoves] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const { data, loading } = useQuery<{
    puzzle: { id: string; fen: string; solution: string; difficulty: number; theme: string[] };
  }>(PUZZLE, { variables: { id } });

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
            const msg = xp > 0 || streak > 0
              ? `Correct! +${xp} XP${streak > 0 ? ` · Streak: ${streak}` : ""}`
              : "Correct! Puzzle solved.";
            toaster.create({ title: msg, type: "success" });
          }
        });
      }
    } else {
      toaster.create({ title: "Wrong move. Try again.", type: "error" });
      setMoves(moves);
    }
  };

  if (loading || !puzzle) {
    return (
      <Box>
        <Text color="gold">Loading puzzle...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Link href="/learning">
        <Button size="sm" variant="outline" color="gold" borderColor="gold">
          Back to learning
        </Button>
      </Link>
      <Heading size="xl" color="gold" fontFamily="serif">
        Puzzle
      </Heading>
      <Text color="whiteAlpha.800">
        Difficulty: {puzzle.difficulty}
        {puzzle.theme?.length ? ` · ${puzzle.theme.join(", ")}` : ""}
      </Text>
      {solved ? (
        <Text color="cameroonGreen" fontSize="lg">
          Solved!
        </Text>
      ) : (
        <>
          <GameBoard
            fen={currentFen}
            orientation="white"
            isMyTurn={true}
            onMove={handleMove}
            allowMove={!solved}
          />
          <Text color="whiteAlpha.600">Moves: {moves.join(" ") || "—"}</Text>
        </>
      )}
    </VStack>
  );
}
