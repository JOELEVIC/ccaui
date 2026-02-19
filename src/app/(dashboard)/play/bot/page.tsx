"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Box, Button, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import { Chess } from "chess.js";
import { GameBoard } from "@/components/chess/GameBoard";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const BOT_DELAY_MS = 400;

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

export default function PlayBotPage() {
  const [fen, setFen] = useState(START_FEN);
  const [orientation] = useState<"white" | "black">("white");
  const [botThinking, setBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chess = new Chess(fen);
  const turnIsWhite = fen.split(" ")[1] === "w";
  const isUserTurn = turnIsWhite;
  const isGameOver = chess.isGameOver();

  const runBot = useCallback(() => {
    const nextFen = fen;
    const moveStr = getRandomMove(nextFen);
    if (!moveStr) return;
    const newFen = applyMove(nextFen, moveStr);
    if (newFen) {
      setFen(newFen);
      setMoveHistory(prev => [...prev, moveStr]);
    }
    setBotThinking(false);
  }, [fen]);

  useEffect(() => {
    if (botThinking) {
      botTimeoutRef.current = setTimeout(runBot, BOT_DELAY_MS);
      return () => {
        if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
      };
    }
  }, [botThinking, runBot]);

  const handleMove = useCallback((moveStr: string) => {
    const newFen = applyMove(fen, moveStr);
    if (!newFen) return;
    setFen(newFen);
    setMoveHistory(prev => [...prev, moveStr]);
    const turnIsBlack = newFen.split(" ")[1] === "b";
    if (turnIsBlack && !new Chess(newFen).isGameOver()) {
      setBotThinking(true);
    }
  }, [fen]);

  const handleNewGame = () => {
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
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
          <Button size="sm" borderRadius="soft" bg="gold" color="black" _hover={{ bg: "goldLight" }} onClick={handleNewGame}>
            New game
          </Button>
          <Link href="/games">
            <Button size="sm" variant="ghost" color="textMuted" borderRadius="soft">
              Back to Play
            </Button>
          </Link>
        </HStack>
      </Flex>

      <Flex direction={{ base: "column", lg: "row" }} justify="center" align="flex-start" gap={6}>
        <VStack gap={2}>
          <Box py={2} px={3} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="goldDark" minW="200px" textAlign="center">
            <Text color="textSecondary" fontSize="sm">You (White)</Text>
          </Box>
          <GameBoard
            fen={fen}
            orientation={orientation}
            isMyTurn={!isGameOver && isUserTurn && !botThinking}
            onMove={handleMove}
            allowMove={!isGameOver && !botThinking}
          />
          <Box py={2} px={3} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="goldDark" minW="200px" textAlign="center">
            <Text color="textMuted" fontSize="sm">Bot (Black)</Text>
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
            {moveHistory.length === 0 && <Text color="textMuted" fontSize="sm">—</Text>}
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
