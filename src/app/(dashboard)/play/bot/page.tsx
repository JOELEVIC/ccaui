"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Dialog,
} from "@chakra-ui/react";
import { Chess } from "chess.js";
import { GameBoard } from "@/components/chess/GameBoard";
import { MaterialDisplay } from "@/components/chess/MaterialDisplay";
import { EvaluationBar } from "@/components/chess/EvaluationBar";
import { TierLabel } from "@/components/dashboard/TierLabel";
import { useStockfish } from "@/lib/useStockfish";
import type { Evaluation } from "@/lib/useStockfish";
import { toaster } from "@/lib/toaster";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const BOT_ELO_PRESETS = [230, 400, 600, 800, 1000, 1200, 1600, 2000, 2400, 2800, 3200];

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

function buildFenAtMove(startFen: string, moves: string[], upToIndex: number): string {
  let fen = startFen;
  for (let i = 0; i < upToIndex && i < moves.length; i++) {
    const next = applyMove(fen, moves[i]);
    if (!next) break;
    fen = next;
  }
  return fen;
}

const EVAL_DEBOUNCE_MS = 400;

export default function PlayBotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eloParam = searchParams.get("elo");
  const elo = useMemo(() => {
    const n = eloParam ? parseInt(eloParam, 10) : 1600;
    return BOT_ELO_PRESETS.includes(n) ? n : 1600;
  }, [eloParam]);

  const [fen, setFen] = useState(START_FEN);
  const [orientation] = useState<"white" | "black">("white");
  const [botThinking, setBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [viewingIndex, setViewingIndex] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [gameResult, setGameResult] = useState<"1-0" | "0-1" | "1/2-1/2" | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const evalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getBestMove, getEvaluation, ready: stockfishReady, error: stockfishError } = useStockfish(elo);

  const displayFen = useMemo(
    () => buildFenAtMove(START_FEN, moveHistory, viewingIndex),
    [moveHistory, viewingIndex]
  );

  const turnIsWhite = displayFen.split(" ")[1] === "w";
  const isUserTurn = turnIsWhite;
  const atHead = viewingIndex === moveHistory.length;

  useEffect(() => {
    if (!showAnalysis) {
      setEvaluation(null);
      setEvalLoading(false);
      if (evalTimeoutRef.current) {
        clearTimeout(evalTimeoutRef.current);
        evalTimeoutRef.current = null;
      }
      return;
    }

    if (evalTimeoutRef.current) {
      clearTimeout(evalTimeoutRef.current);
    }

    evalTimeoutRef.current = setTimeout(() => {
      evalTimeoutRef.current = null;
      setEvalLoading(true);
      getEvaluation(displayFen)
        .then((ev) => {
          setEvaluation(ev);
        })
        .finally(() => {
          setEvalLoading(false);
        });
    }, EVAL_DEBOUNCE_MS);

    return () => {
      if (evalTimeoutRef.current) {
        clearTimeout(evalTimeoutRef.current);
      }
    };
  }, [showAnalysis, displayFen, getEvaluation]);

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
      const c = new Chess(newFen);
      setFen(newFen);
      setMoveHistory((prev) => [...prev, moveStr!]);
      setViewingIndex((i) => i + 1);
      if (c.isGameOver()) {
        setGameResult(c.isCheckmate() ? "0-1" : "1/2-1/2");
        setGameOverReason(c.isCheckmate() ? "Checkmate" : "Draw");
      }
    }
    setBotThinking(false);
  }, [fen, stockfishReady, getBestMove]);

  useEffect(() => {
    if (!botThinking) return;
    runBot();
  }, [botThinking, runBot]);

  const handleMove = useCallback(
    (moveStr: string) => {
      if (!atHead || gameResult) return;
      const newFen = applyMove(fen, moveStr);
      if (!newFen) return;
      setFen(newFen);
      setMoveHistory((prev) => [...prev, moveStr]);
      setViewingIndex((i) => i + 1);

      const c = new Chess(newFen);
      if (c.isGameOver()) {
        if (c.isCheckmate()) setGameResult("1-0");
        else if (c.isStalemate() || c.isDraw()) setGameResult("1/2-1/2");
        setGameOverReason(c.isCheckmate() ? "Checkmate" : "Draw");
      } else {
        const turnIsBlack = newFen.split(" ")[1] === "b";
        if (turnIsBlack) setBotThinking(true);
      }
    },
    [fen, atHead, gameResult]
  );

  const handleResign = useCallback(() => {
    if (gameResult) return;
    setGameResult("0-1");
    setGameOverReason("Resignation");
    setBotThinking(false);
  }, [gameResult]);

  const handleOfferDraw = useCallback(() => {
    if (gameResult) return;
    const c = new Chess(fen);
    if (c.isDraw() || c.isStalemate()) {
      setGameResult("1/2-1/2");
      setGameOverReason("Draw agreed");
    } else {
      toaster.create({ title: "Bot declined the draw", type: "info" });
    }
  }, [fen, gameResult]);

  const handleRematch = useCallback(() => {
    setFen(START_FEN);
    setMoveHistory([]);
    setViewingIndex(0);
    setGameResult(null);
    setGameOverReason(null);
    setBotThinking(false);
  }, []);

  const handlePlayNewGame = useCallback(() => {
    router.push("/games");
  }, [router]);

  const canGoBack = viewingIndex > 0;
  const canGoForward = viewingIndex < moveHistory.length;

  return (
    <VStack align="stretch" gap={6}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text color="gold" fontWeight="600" fontSize="lg">
          Practice vs Bot · {elo} ELO
        </Text>
        {botThinking && (
          <Text color="textMuted" fontSize="sm">
            Thinking...
          </Text>
        )}
        <HStack gap={2}>
          <Button
            size="sm"
            variant={showAnalysis ? "solid" : "outline"}
            bg={showAnalysis ? "gold" : "transparent"}
            color={showAnalysis ? "black" : "gold"}
            borderColor="gold"
            borderRadius="soft"
            onClick={() => setShowAnalysis((s) => !s)}
            disabled={!!gameResult}
          >
            {showAnalysis ? "Analysis on" : "Analysis"}
          </Button>
          <Link href="/games">
            <Button size="sm" variant="ghost" color="textMuted" borderRadius="soft">
              Back to Play
            </Button>
          </Link>
        </HStack>
      </Flex>

      {stockfishError && (
        <Text color="statusWarning" fontSize="xs">
          Engine unavailable, using random moves
        </Text>
      )}

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
          <HStack align="flex-start" gap={2}>
            {showAnalysis && (
              <EvaluationBar
                evaluation={evaluation}
                loading={evalLoading}
                orientation={orientation}
              />
            )}
            <GameBoard
              fen={displayFen}
              orientation={orientation}
              isMyTurn={!gameResult && atHead && isUserTurn && !botThinking}
              onMove={handleMove}
              allowMove={!gameResult && atHead && !botThinking}
            />
          </HStack>
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
            <HStack justify="center" gap={2} flexWrap="wrap">
              <Text color="textMuted" fontSize="sm">
                Bot (Black) · {elo} ELO
              </Text>
              <TierLabel rating={elo} size="sm" />
            </HStack>
          </Box>
        </VStack>

        <VStack align="stretch" gap={4} minW="200px">
          <MaterialDisplay fen={displayFen} />

          <Box
            py={3}
            px={4}
            borderRadius="soft"
            borderWidth="1px"
            borderColor="goldDark"
            bg="bgCard"
          >
            <Text color="gold" fontSize="xs" fontWeight="600" mb={2}>
              Moves
            </Text>
            <HStack gap={2} mb={2}>
              <Button
                size="sm"
                variant="outline"
                borderColor="goldDark"
                color="gold"
                borderRadius="soft"
                onClick={() => setViewingIndex((i) => Math.max(0, i - 1))}
                disabled={!canGoBack}
                px={2}
              >
                ←
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor="goldDark"
                color="gold"
                borderRadius="soft"
                onClick={() => setViewingIndex((i) => Math.min(moveHistory.length, i + 1))}
                disabled={!canGoForward}
                px={2}
              >
                →
              </Button>
              <Text color="textMuted" fontSize="xs">
                {viewingIndex} / {moveHistory.length}
              </Text>
            </HStack>
            <Flex gap={2} flexWrap="wrap" maxH="120px" overflowY="auto">
              {moveHistory.map((m, i) => (
                <Text
                  key={i}
                  color={i < viewingIndex ? "gold" : "textMuted"}
                  fontSize="sm"
                  fontWeight={i === viewingIndex - 1 ? "600" : "normal"}
                >
                  {m}
                </Text>
              ))}
              {moveHistory.length === 0 && (
                <Text color="textMuted" fontSize="sm">
                  —
                </Text>
              )}
            </Flex>
          </Box>

          {!gameResult && atHead && (
            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                borderColor="statusWarning"
                color="statusWarning"
                borderRadius="soft"
                onClick={handleResign}
              >
                Resign
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor="goldDark"
                color="textSecondary"
                borderRadius="soft"
                onClick={handleOfferDraw}
              >
                Offer draw
              </Button>
            </HStack>
          )}
        </VStack>
      </Flex>

      <Dialog.Root open={!!gameResult} onOpenChange={() => {}}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="bgCard" borderWidth="1px" borderColor="goldDark">
            <Dialog.Body pt={6}>
              <Dialog.Title>
                <Text color="gold" fontSize="xl" fontWeight="700" textAlign="center" mb={2}>
                  {gameResult === "1-0"
                    ? "You win!"
                    : gameResult === "0-1"
                      ? "You lose"
                      : "Draw"}
                </Text>
              </Dialog.Title>
              <Text color="textMuted" fontSize="sm" textAlign="center">
                {gameOverReason} · {gameResult}
              </Text>
            </Dialog.Body>
            <Dialog.Footer gap={2} justifyContent="center" pb={6}>
              <Button
                size="sm"
                bg="gold"
                color="black"
                borderRadius="soft"
                _hover={{ bg: "goldLight" }}
                onClick={handleRematch}
              >
                Rematch
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor="gold"
                color="gold"
                borderRadius="soft"
                onClick={handlePlayNewGame}
              >
                Play new game
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </VStack>
  );
}
