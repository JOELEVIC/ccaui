"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  VStack,
  HStack,
  Flex,
  Dialog,
  Switch,
} from "@chakra-ui/react";
import { Chess } from "chess.js";
import { motion } from "framer-motion";
import { GameBoard, type PendingPremove } from "@/components/chess/GameBoard";
import { isPremoveStillValid } from "@/lib/chessPremoves";
import { MaterialDisplay } from "@/components/chess/MaterialDisplay";
import { EvaluationBar } from "@/components/chess/EvaluationBar";
import { TierLabel } from "@/components/dashboard/TierLabel";
import { useStockfish } from "@/lib/useStockfish";
import type { Evaluation } from "@/lib/useStockfish";
import { toaster } from "@/lib/toaster";
import {
  ChessWatermark,
  GlassCard,
  GoldRule,
  LuxuryButton,
  LuxuryEyebrow,
  LuxuryHeading,
} from "@/components/luxury/LuxuryPrimitives";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const BOT_ELO_PRESETS = [230, 400, 600, 800, 1000, 1200, 1600, 2000, 2400, 2800, 3200];

const LS_PREMOVE = "dchess-game-premove";

function readStoredBool(key: string, defaultVal: boolean): boolean {
  if (typeof window === "undefined") return defaultVal;
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultVal;
    return v === "1" || v === "true";
  } catch {
    return defaultVal;
  }
}

function safeChess(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

function getRandomMove(fen: string): string | null {
  const chess = safeChess(fen);
  if (!chess) return null;
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const move = moves[Math.floor(Math.random() * moves.length)];
  return `${move.from}${move.to}${move.promotion ? move.promotion : ""}`;
}

function applyMove(fen: string, moveStr: string): string | null {
  const from = moveStr.slice(0, 2);
  const to = moveStr.slice(2, 4);
  const promotion = (moveStr[4] as "q" | "r" | "b" | "n") || undefined;
  const c = safeChess(fen);
  if (!c) return null;
  try {
    const move = c.move({ from, to, promotion });
    return move ? c.fen() : null;
  } catch {
    return null;
  }
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
  const fenParam = searchParams.get("fen");
  const orientationParam = searchParams.get("orientation");
  const elo = useMemo(() => {
    const n = eloParam ? parseInt(eloParam, 10) : 1600;
    return BOT_ELO_PRESETS.includes(n) ? n : 1600;
  }, [eloParam]);
  const startFen = useMemo(() => {
    if (!fenParam) return START_FEN;
    try {
      new Chess(fenParam);
      return fenParam;
    } catch {
      return START_FEN;
    }
  }, [fenParam]);

  const [fen, setFen] = useState(startFen);
  const [orientation] = useState<"white" | "black">(orientationParam === "black" ? "black" : "white");
  const [botThinking, setBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [viewingIndex, setViewingIndex] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [gameResult, setGameResult] = useState<"1-0" | "0-1" | "1/2-1/2" | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const [premoveEnabled, setPremoveEnabled] = useState(() => readStoredBool(LS_PREMOVE, false));
  const [pendingPremove, setPendingPremove] = useState<PendingPremove | null>(null);
  const evalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    getBestMove,
    getEvaluation,
    ready: stockfishReady,
    error: stockfishError,
    wasmDead,
  } = useStockfish(elo);

  const displayFen = useMemo(
    () => buildFenAtMove(startFen, moveHistory, viewingIndex),
    [startFen, moveHistory, viewingIndex]
  );

  const turnIsWhite = displayFen.split(" ")[1] === "w";
  const isUserTurn = orientation === "white" ? turnIsWhite : !turnIsWhite;
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

  // Fire the bot on initial load when the loaded FEN starts on the bot's turn.
  useEffect(() => {
    if (moveHistory.length > 0 || gameResult || botThinking) return;
    const turnIsWhite = startFen.split(" ")[1] === "w";
    const startIsBotTurn = orientation === "white" ? !turnIsWhite : turnIsWhite;
    if (startIsBotTurn) setBotThinking(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startFen, orientation]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PREMOVE, premoveEnabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [premoveEnabled]);

  useEffect(() => {
    if (gameResult || !atHead) setPendingPremove(null);
  }, [gameResult, atHead]);

  useEffect(() => {
    if (!pendingPremove || isUserTurn) return;
    const myColor = orientation === "white" ? "w" : "b";
    if (!isPremoveStillValid(fen, myColor, pendingPremove.from, pendingPremove.to)) {
      setPendingPremove(null);
    }
  }, [fen, isUserTurn, pendingPremove, orientation]);

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
        if (c.isCheckmate()) {
          // The side that just moved (the user, here) delivered mate.
          setGameResult(orientation === "white" ? "1-0" : "0-1");
        } else if (c.isStalemate() || c.isDraw()) {
          setGameResult("1/2-1/2");
        }
        setGameOverReason(c.isCheckmate() ? "Checkmate" : "Draw");
      } else {
        const newTurnIsWhite = newFen.split(" ")[1] === "w";
        const isBotTurn = orientation === "white" ? !newTurnIsWhite : newTurnIsWhite;
        if (isBotTurn) setBotThinking(true);
      }
    },
    [fen, atHead, gameResult, orientation]
  );

  useEffect(() => {
    if (!atHead || gameResult || botThinking || !pendingPremove || !isUserTurn) return;
    const uci = `${pendingPremove.from}${pendingPremove.to}${pendingPremove.promotion ?? ""}`;
    if (!applyMove(fen, uci)) {
      setPendingPremove(null);
      return;
    }
    setPendingPremove(null);
    handleMove(uci);
  }, [atHead, gameResult, botThinking, pendingPremove, fen, isUserTurn, handleMove]);

  const handleResign = useCallback(() => {
    if (gameResult) return;
    setGameResult(orientation === "white" ? "0-1" : "1-0");
    setGameOverReason("Resignation");
    setBotThinking(false);
  }, [gameResult, orientation]);

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
    setFen(startFen);
    setMoveHistory([]);
    setViewingIndex(0);
    setGameResult(null);
    setGameOverReason(null);
    setBotThinking(false);
    // If the position to defend / drill starts on the bot's turn, fire it.
    const startTurnIsWhite = startFen.split(" ")[1] === "w";
    const startIsBotTurn = orientation === "white" ? !startTurnIsWhite : startTurnIsWhite;
    if (startIsBotTurn) setBotThinking(true);
  }, [startFen, orientation]);

  const handlePlayNewGame = useCallback(() => {
    router.push("/games");
  }, [router]);

  const canGoBack = viewingIndex > 0;
  const canGoForward = viewingIndex < moveHistory.length;

  return (
    <Box position="relative" maxW="1280px" mx="auto">
      <ChessWatermark piece="knight" size={420} opacity={0.035} position={{ top: "60px", right: "-60px" }} />

      {/* Header strip */}
      <Box mb={{ base: 5, md: 7 }} position="relative" zIndex={1}>
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <HStack gap={3} align="center" flexWrap="wrap">
            <LuxuryHeading size="lg">
              <Text as="span" color="var(--lux-gold)" style={{ fontStyle: "italic" }}>Engine</Text>
            </LuxuryHeading>
            <Box
              px={3}
              py={1.5}
              borderRadius="999px"
              bg="var(--lux-glass-surface)"
              borderWidth="1px"
              borderColor="var(--lux-glass-border)"
              style={{ backdropFilter: "blur(10px)" }}
            >
              <Text
                fontFamily="var(--font-inter), sans-serif"
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.22em"
                textTransform="uppercase"
                color="var(--lux-gold)"
              >
                {elo}
              </Text>
            </Box>
            {botThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                aria-label="Engine thinking"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--lux-gold)",
                  boxShadow: "0 0 8px var(--lux-gold)",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
            )}
          </HStack>

          <HStack gap={2} flexWrap="wrap" align="center">
            <ToggleChip
              label="Premove"
              on={premoveEnabled}
              onToggle={() => setPremoveEnabled((v) => !v)}
            />
            <ToggleChip
              label="Eval"
              on={showAnalysis}
              onToggle={() => setShowAnalysis((s) => !s)}
              disabled={!!gameResult}
            />
            <LuxuryButton variant="ghost" size="sm" glyph="←" href="/games">
              Back
            </LuxuryButton>
          </HStack>
        </HStack>

        {wasmDead && (
          <Text mt={3} fontSize="xs" color="rgba(255,200,120,0.9)" letterSpacing="0.16em" textTransform="uppercase">
            ◇ Browser engine offline — running on server
          </Text>
        )}
        {stockfishError && !wasmDead && (
          <Text mt={3} fontSize="xs" color="rgba(240,101,149,0.9)" letterSpacing="0.16em" textTransform="uppercase">
            ⚠ {stockfishError}
          </Text>
        )}
      </Box>

      {/* Board + side rail */}
      <Flex direction={{ base: "column", lg: "row" }} justify="center" align="flex-start" gap={{ base: 5, lg: 7 }}>
        <VStack gap={3} flex="0 0 auto">
          <PlayerNameplate
            label="You"
            colour={orientation === "white" ? "white" : "black"}
            highlight={isUserTurn && !gameResult && !botThinking}
          />
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
              movePending={false}
              onMove={handleMove}
              allowMove={!gameResult && atHead && !botThinking}
              premoveEnabled={premoveEnabled}
              pendingPremove={pendingPremove}
              onPendingPremove={setPendingPremove}
            />
          </HStack>
          <PlayerNameplate
            label={`Engine · ${elo} Elo`}
            colour={orientation === "white" ? "black" : "white"}
            highlight={botThinking}
            tierBadge={<TierLabel rating={elo} size="sm" />}
          />
        </VStack>

        <VStack align="stretch" gap={4} flex="1 1 280px" minW="260px" maxW={{ lg: "360px" }}>
          <MaterialDisplay fen={displayFen} />

          <GlassCard>
            <Box px={5} py={4}>
              <HStack justify="space-between" align="center" mb={3}>
                <LuxuryEyebrow>Move Log</LuxuryEyebrow>
                <Text
                  fontFamily="var(--font-inter), sans-serif"
                  fontSize="xs"
                  className="lux-text-muted"
                  letterSpacing="0.12em"
                >
                  {viewingIndex} / {moveHistory.length}
                </Text>
              </HStack>
              <HStack gap={2} mb={3}>
                <LuxuryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingIndex((i) => Math.max(0, i - 1))}
                  disabled={!canGoBack}
                >
                  ←
                </LuxuryButton>
                <LuxuryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingIndex((i) => Math.min(moveHistory.length, i + 1))}
                  disabled={!canGoForward}
                >
                  →
                </LuxuryButton>
                <LuxuryButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingIndex(moveHistory.length)}
                  disabled={atHead}
                >
                  Jump to live
                </LuxuryButton>
              </HStack>
              <Flex
                gap={2}
                flexWrap="wrap"
                maxH="140px"
                overflowY="auto"
                pr={1}
                fontFamily="var(--font-inter), sans-serif"
              >
                {moveHistory.map((m, i) => (
                  <Text
                    key={i}
                    fontSize="sm"
                    color={i < viewingIndex ? "var(--lux-text-primary)" : "var(--lux-text-muted)"}
                    fontWeight={i === viewingIndex - 1 ? "700" : "500"}
                    px={1.5}
                    borderRadius="4px"
                    bg={i === viewingIndex - 1 ? "rgba(212,175,55,0.12)" : "transparent"}
                    border={i === viewingIndex - 1 ? "1px solid rgba(212,175,55,0.35)" : "1px solid transparent"}
                    style={{ letterSpacing: "0.04em" }}
                  >
                    {m}
                  </Text>
                ))}
                {moveHistory.length === 0 && (
                  <Text className="lux-text-muted" fontSize="sm" fontStyle="italic">
                    The board is set. Make the first move.
                  </Text>
                )}
              </Flex>
            </Box>
          </GlassCard>

          {!gameResult && atHead && (
            <HStack gap={2}>
              <LuxuryButton variant="outline" size="sm" onClick={handleResign} full>
                Resign
              </LuxuryButton>
              <LuxuryButton variant="ghost" size="sm" onClick={handleOfferDraw} full>
                Offer draw
              </LuxuryButton>
            </HStack>
          )}
        </VStack>
      </Flex>

      <Dialog.Root open={!!gameResult} onOpenChange={() => {}}>
        <Dialog.Backdrop style={{ background: "rgba(5,7,10,0.86)", backdropFilter: "blur(8px)" }} />
        <Dialog.Positioner>
          <Dialog.Content
            bg="transparent"
            border="none"
            boxShadow="none"
            maxW="460px"
            w="full"
            mx={4}
          >
            <GameOverPanel
              result={gameResult}
              reason={gameOverReason}
              onRematch={handleRematch}
              onNewGame={handlePlayNewGame}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

/* ─────────── PlayerNameplate ─────────── */

function PlayerNameplate({
  label,
  colour,
  highlight,
  tierBadge,
}: {
  label: string;
  colour: "white" | "black";
  highlight: boolean;
  tierBadge?: React.ReactNode;
}) {
  return (
    <Box
      px={4}
      py={2.5}
      borderRadius="8px"
      bg="var(--lux-glass-surface)"
      borderWidth="1px"
      borderColor={highlight ? "rgba(212,175,55,0.6)" : "var(--lux-glass-border)"}
      style={{
        backdropFilter: "blur(12px) saturate(120%)",
        WebkitBackdropFilter: "blur(12px) saturate(120%)",
        boxShadow: highlight ? "var(--lux-ring-gold)" : "0 8px 22px rgba(0,0,0,0.35)",
        transition: "all 0.2s ease",
      }}
      minW={{ md: "240px" }}
    >
      <HStack gap={3} justify="center" align="center">
        <Box
          w="14px"
          h="14px"
          borderRadius="full"
          bg={colour === "white" ? "#f5efe3" : "#0a0d12"}
          borderWidth="1px"
          borderColor={colour === "white" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)"}
          style={{
            boxShadow:
              colour === "white"
                ? "0 0 8px rgba(255,255,255,0.5)"
                : "0 0 8px rgba(0,0,0,0.7), inset 0 0 4px rgba(255,255,255,0.2)",
          }}
        />
        <Text
          fontFamily="var(--font-playfair), Georgia, serif"
          fontSize="md"
          fontWeight="600"
          color="var(--lux-text-primary)"
          letterSpacing="0.04em"
        >
          {label}
        </Text>
        {tierBadge && <Box>{tierBadge}</Box>}
        {highlight && (
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg="var(--lux-gold)"
            style={{ boxShadow: "0 0 8px var(--lux-gold)" }}
          />
        )}
      </HStack>
    </Box>
  );
}

/* ─────────── ToggleChip ─────────── */

function ToggleChip({
  label,
  on,
  onToggle,
  disabled,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <Box
      as="button"
      onClick={disabled ? undefined : onToggle}
      px={3.5}
      py={2}
      borderRadius="999px"
      bg="var(--lux-glass-surface)"
      borderWidth="1px"
      borderColor={on ? "rgba(212,175,55,0.55)" : "var(--lux-glass-border)"}
      transition="all 0.2s ease"
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.45 : 1}
      _hover={!disabled ? { borderColor: "rgba(212,175,55,0.55)" } : undefined}
      style={{ backdropFilter: "blur(12px)" }}
    >
      <HStack gap={2}>
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg={on ? "var(--lux-gold)" : "rgba(255,255,255,0.3)"}
          style={on ? { boxShadow: "0 0 6px var(--lux-gold)" } : undefined}
        />
        <Text
          fontFamily="var(--font-inter), sans-serif"
          fontSize="xs"
          letterSpacing="0.18em"
          textTransform="uppercase"
          fontWeight="600"
          color={on ? "var(--lux-gold)" : "var(--lux-text-secondary)"}
        >
          {label}
        </Text>
      </HStack>
      {/* Hidden Switch state — kept for accessibility tooling */}
      <Switch.Root checked={on} onCheckedChange={() => {}} hidden>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </Box>
  );
}

/* ─────────── GameOverPanel ─────────── */

function GameOverPanel({
  result,
  reason,
  onRematch,
  onNewGame,
}: {
  result: "1-0" | "0-1" | "1/2-1/2" | null;
  reason: string | null;
  onRematch: () => void;
  onNewGame: () => void;
}) {
  const title =
    result === "1-0" ? "Victory" : result === "0-1" ? "Defeat" : "Draw";

  return (
    <Box
      position="relative"
      p={{ base: 6, md: 8 }}
      borderRadius="12px"
      bg="var(--lux-obsidian-elev)"
      borderWidth="1px"
      borderColor="rgba(212,175,55,0.4)"
      style={{
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 60px rgba(212,175,55,0.18)",
      }}
    >
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        style={{ background: "var(--lux-gradient-hero)", borderRadius: 12 }}
      />
      <VStack gap={4} textAlign="center" position="relative" zIndex={1}>
        <LuxuryEyebrow>{reason ?? "Game complete"} · {result}</LuxuryEyebrow>
        <Box>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "5xl", md: "6xl" }}
            color="var(--lux-gold)"
            fontWeight="600"
            lineHeight="1"
            letterSpacing="0.04em"
            style={{ textShadow: "0 0 20px rgba(212,175,55,0.4)", fontStyle: "italic" }}
          >
            {title}
          </Text>
        </Box>
        <Box display="flex" justifyContent="center">
          <GoldRule wide />
        </Box>
        <HStack mt={3} gap={3} justify="center" flexWrap="wrap">
          <LuxuryButton variant="gold" size="md" glyph="↻" onClick={onRematch}>
            Rematch
          </LuxuryButton>
          <LuxuryButton variant="outline" size="md" onClick={onNewGame}>
            New game
          </LuxuryButton>
          <LuxuryButton variant="ghost" size="md" href="/road-to-master">
            Road to Master
          </LuxuryButton>
        </HStack>
      </VStack>
    </Box>
  );
}
