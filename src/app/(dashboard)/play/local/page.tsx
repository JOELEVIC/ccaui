"use client";

import { useState, useCallback } from "react";
import { Box, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import { Chess } from "chess.js";
import { GameBoard } from "@/components/chess/GameBoard";
import {
  ChessWatermark,
  GlassCard,
  GoldRule,
  LuxuryButton,
  LuxuryEyebrow,
  LuxuryHeading,
} from "@/components/luxury/LuxuryPrimitives";

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
    <Box position="relative" maxW="1180px" mx="auto">
      <ChessWatermark piece="rook" size={380} opacity={0.035} position={{ top: "40px", right: "-50px" }} />

      <Box mb={{ base: 5, md: 7 }} position="relative" zIndex={1}>
        <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={4}>
          <Box>
            <LuxuryEyebrow>At the Board · Local</LuxuryEyebrow>
            <Box mt={2}>
              <LuxuryHeading size="lg">
                Pass <Text as="span" color="var(--lux-gold)" style={{ fontStyle: "italic" }}>and play</Text>.
              </LuxuryHeading>
            </Box>
            <HStack mt={3} gap={3} align="center">
              <GoldRule />
              <Text fontSize="sm" className="lux-text-secondary">
                One device, two players. Flip the board between moves or share a screen at the table.
              </Text>
            </HStack>
          </Box>
          <HStack gap={3} flexWrap="wrap">
            <LuxuryButton variant="ghost" size="sm" glyph="↺" onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}>
              Flip board
            </LuxuryButton>
            <LuxuryButton variant="gold" size="sm" glyph="↻" onClick={handleNewGame}>
              New game
            </LuxuryButton>
            <LuxuryButton variant="ghost" size="sm" glyph="←" href="/games">
              Back to Play
            </LuxuryButton>
          </HStack>
        </HStack>
      </Box>

      <Flex direction={{ base: "column", lg: "row" }} justify="center" align="flex-start" gap={{ base: 4, lg: 7 }}>
        <VStack gap={3} flex="0 0 auto">
          <Box
            px={4}
            py={2.5}
            borderRadius="8px"
            bg="var(--lux-glass-surface)"
            borderWidth="1px"
            borderColor="var(--lux-glass-border)"
            style={{ backdropFilter: "blur(12px)" }}
            minW="240px"
            textAlign="center"
          >
            <Text fontSize="xs" className="lux-text-muted" letterSpacing="0.2em" textTransform="uppercase">
              {orientation === "white" ? "Black" : "White"} · top
            </Text>
          </Box>
          <GameBoard
            fen={fen}
            orientation={orientation}
            isMyTurn={!isGameOver}
            onMove={handleMove}
            allowMove={!isGameOver}
          />
          <Box
            px={4}
            py={2.5}
            borderRadius="8px"
            bg="var(--lux-glass-surface)"
            borderWidth="1px"
            borderColor={isGameOver ? "rgba(212,175,55,0.55)" : "var(--lux-glass-border)"}
            style={{
              backdropFilter: "blur(12px)",
              boxShadow: isGameOver ? "var(--lux-ring-gold)" : undefined,
            }}
            minW="240px"
            textAlign="center"
          >
            <HStack gap={2} justify="center" align="center">
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={turnIsWhite ? "#f5efe3" : "#0a0d12"}
                borderWidth="1px"
                borderColor={turnIsWhite ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.45)"}
              />
              <Text
                fontFamily="var(--font-inter), sans-serif"
                fontSize="xs"
                letterSpacing="0.2em"
                textTransform="uppercase"
                color="var(--lux-text-primary)"
                fontWeight="600"
              >
                {turnIsWhite ? "White" : "Black"} to move
              </Text>
            </HStack>
          </Box>
        </VStack>

        <Box flex="1 1 280px" minW="260px" maxW={{ lg: "380px" }}>
          <GlassCard>
            <Box px={5} py={4}>
              <LuxuryEyebrow>Match Status</LuxuryEyebrow>
              <Box mt={3}>
                {isGameOver ? (
                  <VStack align="stretch" gap={2}>
                    <Text
                      fontFamily="var(--font-playfair), Georgia, serif"
                      fontSize="2xl"
                      color="var(--lux-gold)"
                      fontWeight="600"
                      letterSpacing="0.04em"
                      lineHeight="1.1"
                      style={{ fontStyle: "italic" }}
                    >
                      {chess.isCheckmate()
                        ? `${turnIsWhite ? "Black" : "White"} wins.`
                        : "Drawn."}
                    </Text>
                    <Text fontSize="sm" className="lux-text-secondary">
                      {chess.isCheckmate() ? "Checkmate." : "The position is balanced — no decisive line."}
                    </Text>
                    <Box pt={2}>
                      <LuxuryButton variant="gold" size="sm" glyph="↻" onClick={handleNewGame}>
                        Reset the board
                      </LuxuryButton>
                    </Box>
                  </VStack>
                ) : (
                  <Text fontSize="sm" className="lux-text-secondary" lineHeight="1.55">
                    The board is set. Make a move — the clock starts when the first piece lifts.
                  </Text>
                )}
              </Box>
            </Box>
          </GlassCard>
        </Box>
      </Flex>
    </Box>
  );
}
