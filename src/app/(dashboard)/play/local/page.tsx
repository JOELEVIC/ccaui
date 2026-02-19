"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Box, Button, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import { Chess } from "chess.js";
import { GameBoard } from "@/components/chess/GameBoard";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function PlayLocalPage() {
  const [fen, setFen] = useState(START_FEN);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const chess = new Chess(fen);
  const turnIsWhite = fen.split(" ")[1] === "w";
  const isGameOver = chess.isGameOver();

  const handleMove = useCallback((moveStr: string) => {
    const from = moveStr.slice(0, 2);
    const to = moveStr.slice(2, 4);
    const promotion = moveStr[4] as "q" | "r" | "b" | "n" | undefined;
    const c = new Chess(fen);
    const move = c.move({ from, to, promotion: promotion || undefined });
    if (move) setFen(c.fen());
  }, [fen]);

  const handleNewGame = () => setFen(START_FEN);

  return (
    <VStack align="stretch" gap={6}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text color="gold" fontWeight="600" fontSize="lg">
          Play vs Self
        </Text>
        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            borderColor="goldDark"
            color="textSecondary"
            borderRadius="soft"
            onClick={() => setOrientation(o => (o === "white" ? "black" : "white"))}
          >
            Flip board
          </Button>
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
            <Text color="textMuted" fontSize="xs">You (both sides)</Text>
          </Box>
          <GameBoard
            fen={fen}
            orientation={orientation}
            isMyTurn={!isGameOver}
            onMove={handleMove}
            allowMove={!isGameOver}
          />
          <Box py={2} px={3} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="goldDark" minW="200px" textAlign="center">
            <Text color="textMuted" fontSize="xs">{turnIsWhite ? "White" : "Black"} to move</Text>
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
          <Text color="textMuted" fontSize="sm">
            {isGameOver ? (chess.isCheckmate() ? `Checkmate. ${turnIsWhite ? "Black" : "White"} wins.` : "Game over.") : "—"}
          </Text>
        </Box>
      </Flex>
    </VStack>
  );
}
