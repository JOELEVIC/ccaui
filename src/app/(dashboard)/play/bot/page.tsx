"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Box, Button, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import { Chess } from "chess.js";
import { GameBoard } from "@/components/chess/GameBoard";
import { useStockfish, type Difficulty } from "@/lib/useStockfish";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function getRandomMove(fen: string): string | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const move = moves[Math.floor(Math.random() * moves.length)];
  return `${move.from}${move.to}${move.promotion ? move.promotion : ""}`;
}

function applyMove(fen: string, moveStr: string): string | null {
  const from = moveStr.slice(0, 2);
  const to = moveStr.slice(2, 4);
  const promotion = (moveStr[4] as "q" | "r" | "b" | "n") || undefined;
  const c = new Chess(fen);
  const move = c.move({ from, to, promotion });
  return move ? c.fen() : null;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function PlayBotPage() {
  const [fen, setFen] = useState(START_FEN);
  const [orientation] = useState<"white" | "black">("white");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [botThinking, setBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const { getBestMove, ready: stockfishReady, error: stockfishError } = useStockfish(difficulty);

  const chess = new Chess(fen);
  const turnIsWhite = fen.split(" ")[1] === "w";
  const isUserTurn = turnIsWhite;
  const isGameOver = chess.isGameOver();

  const runBot = useCallback(async () => {
    const nextFen = fen;
    let moveStr: string | null = null;

    if (stockfishReady) {
      moveStr = await getBestMove(nextFen);
    }
    if (!moveStr) {
      moveStr = getRandomMove(nextFen);
    }

    if (!moveStr) {
      setBotThinking(false);
      return;
    }

    const newFen = applyMove(nextFen, moveStr);
    if (newFen) {
      setFen(newFen);
      setMoveHistory((prev) => [...prev, moveStr!]);
    }
    setBotThinking(false);
  }, [fen, stockfishReady, getBestMove]);

  useEffect(() => {
    if (!botThinking) return;
    runBot();
  }, [botThinking, runBot]);

  const handleMove = useCallback(
    (moveStr: string) => {
      const newFen = applyMove(fen, moveStr);
      if (!newFen) return;
      setFen(newFen);
      setMoveHistory((prev) => [...prev, moveStr]);
      const turnIsBlack = newFen.split(" ")[1] === "b";
      if (turnIsBlack && !new Chess(newFen).isGameOver()) {
        setBotThinking(true);
      }
    },
    [fen]
  );

  const handleNewGame = () => {
    setBotThinking(false);
    setFen(START_FEN);
    setMoveHistory([]);
  };

  return (
    <VStack align="stretch" gap={6}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text color="gold" fontWeight="600" fontSize="lg">
          Practice vs Bot
        </Text>
        {botThinking && (
          <Text color="textMuted" fontSize="sm">
            Bot is thinking...
          </Text>
        )}
        <HStack gap={2}>
          <Button
            size="sm"
            borderRadius="soft"
            bg="gold"
            color="black"
            _hover={{ bg: "goldLight" }}
            onClick={handleNewGame}
          >
            New game
          </Button>
          <Link href="/games">
            <Button size="sm" variant="ghost" color="textMuted" borderRadius="soft">
              Back to Play
            </Button>
          </Link>
        </HStack>
      </Flex>

      <HStack gap={2} flexWrap="wrap">
        <Text color="textSecondary" fontSize="sm">
          Difficulty:
        </Text>
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <Button
            key={d}
            size="sm"
            variant={difficulty === d ? "solid" : "outline"}
            bg={difficulty === d ? "gold" : "transparent"}
            color={difficulty === d ? "black" : "gold"}
            borderColor="gold"
            borderRadius="soft"
            onClick={() => setDifficulty(d)}
            disabled={botThinking}
          >
            {DIFFICULTY_LABELS[d]}
          </Button>
        ))}
        {!stockfishReady && !stockfishError && (
          <Text color="textMuted" fontSize="xs">
            (loading engine…)
          </Text>
        )}
        {stockfishError && (
          <Text color="statusWarning" fontSize="xs">
            Engine unavailable, using random moves
          </Text>
        )}
      </HStack>

      <Flex direction={{ base: "column", lg: "row" }} justify="center" align="flex-start" gap={6}>
        <VStack gap={2}>
          <Box
            py={2}
            px={3}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
            minW="200px"
            textAlign="center"
          >
            <Text color="textSecondary" fontSize="sm">
              You (White)
            </Text>
          </Box>
          <GameBoard
            fen={fen}
            orientation={orientation}
            isMyTurn={!isGameOver && isUserTurn && !botThinking}
            onMove={handleMove}
            allowMove={!isGameOver && !botThinking}
          />
          <Box
            py={2}
            px={3}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
            minW="200px"
            textAlign="center"
          >
            <Text color="textMuted" fontSize="sm">
              Bot (Black) · {DIFFICULTY_LABELS[difficulty]}
            </Text>
          </Box>
        </VStack>
        <Box
          py={3}
          px={4}
          borderRadius="soft"
          borderWidth="1px"
          borderColor="goldDark"
          bg="bgCard"
          maxH="400px"
          overflowY="auto"
          minW="200px"
        >
          <Text color="gold" fontSize="xs" fontWeight="600" mb={2}>
            Moves
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {moveHistory.map((m, i) => (
              <Text key={i} color="textSecondary" fontSize="sm">
                {m}
              </Text>
            ))}
            {moveHistory.length === 0 && (
              <Text color="textMuted" fontSize="sm">
                —
              </Text>
            )}
          </Flex>
          {isGameOver && (
            <Text color="gold" fontSize="sm" mt={2}>
              {chess.isCheckmate() ? "Checkmate." : "Game over."}
            </Text>
          )}
        </Box>
      </Flex>
    </VStack>
  );
}
