"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Chess } from "chess.js";
import { GameBoard } from "@/components/chess/GameBoard";
import { useStockfish } from "@/lib/useStockfish";
import { BOT_PERSONAS, getPersona, pickLine, type ChatEvent } from "@/lib/botPersonas";

const MotionBox = motion.create(Box);

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Public, no-login play with a personality. A visitor picks an opponent with a
 * face and a voice, and plays a full game immediately. The bot "talks" via a
 * zero-cost, event-keyed chat (see lib/botPersonas) — captures, checks and the
 * result trigger in-character lines, no network round-trip. The engine still
 * falls through WASM → server → in-browser JS, so a game always plays.
 */

interface MoveResult {
  fen: string;
  san: string;
  over: boolean;
  result: "1-0" | "0-1" | "1/2-1/2" | null;
  reason: string | null;
  captured: boolean;
  check: boolean;
}

function makeMove(fen: string, uci: string): MoveResult | null {
  const c = new Chess();
  try {
    c.load(fen);
  } catch {
    return null;
  }
  let mv;
  try {
    mv = c.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: (uci[4] as "q" | "r" | "b" | "n") || "q",
    });
  } catch {
    return null;
  }
  if (!mv) return null;
  let result: MoveResult["result"] = null;
  let reason: string | null = null;
  if (c.isGameOver()) {
    if (c.isCheckmate()) {
      result = c.turn() === "w" ? "0-1" : "1-0";
      reason = "Checkmate";
    } else {
      result = "1/2-1/2";
      reason = c.isStalemate() ? "Stalemate" : "Draw";
    }
  }
  return {
    fen: c.fen(),
    san: mv.san,
    over: c.isGameOver(),
    result,
    reason,
    captured: !!mv.captured,
    check: c.inCheck(),
  };
}

function replayFen(ucis: string[]): string {
  const c = new Chess();
  for (const uci of ucis) {
    try {
      c.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: (uci[4] as "q" | "r" | "b" | "n") || "q",
      });
    } catch {
      break;
    }
  }
  return c.fen();
}

function randomMove(fen: string): string | null {
  const c = new Chess();
  try {
    c.load(fen);
  } catch {
    return null;
  }
  const moves = c.moves({ verbose: true });
  if (!moves.length) return null;
  const m = moves[Math.floor(Math.random() * moves.length)];
  return `${m.from}${m.to}${m.promotion ?? ""}`;
}

interface ChatMsg {
  id: number;
  text: string;
}

export default function PublicPlayPage() {
  const [personaId, setPersonaId] = useState("amina");
  const persona = useMemo(() => getPersona(personaId), [personaId]);
  const { getBestMove, warming } = useStockfish(persona.elo);

  const [fen, setFen] = useState(START_FEN);
  const [moves, setMoves] = useState<{ uci: string; san: string }[]>([]);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<MoveResult["result"]>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const botRunningRef = useRef(false);
  const seedRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const orientation = "white" as const;
  const turn = fen.split(" ")[1];
  const isUserTurn = turn === "w";

  const say = useCallback(
    (event: ChatEvent) => {
      const seed = seedRef.current++;
      const text = pickLine(persona, event, seed);
      if (!text) return;
      setChat((prev) => [...prev.slice(-30), { id: seed, text }]);
    },
    [persona]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [chat]);

  const newGame = useCallback(
    (nextPersonaId?: string) => {
      if (nextPersonaId) setPersonaId(nextPersonaId);
      setFen(START_FEN);
      setMoves([]);
      setResult(null);
      setReason(null);
      setThinking(false);
      botRunningRef.current = false;
      const p = nextPersonaId ? getPersona(nextPersonaId) : persona;
      seedRef.current = 0;
      setChat([{ id: -1, text: pickLine(p, "greeting", 0) }]);
    },
    [persona]
  );

  // Greet on first mount.
  useEffect(() => {
    setChat([{ id: -1, text: pickLine(persona, "greeting", 0) }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runBot = useCallback(async () => {
    if (botRunningRef.current) return;
    botRunningRef.current = true;
    try {
      const current = fen;
      let uci = await getBestMove(current);
      if (!uci) uci = randomMove(current);
      if (!uci) {
        setThinking(false);
        return;
      }
      const r = makeMove(current, uci);
      if (r) {
        setFen(r.fen);
        setMoves((prev) => [...prev, { uci: uci!, san: r.san }]);
        if (r.over) {
          setResult(r.result);
          setReason(r.reason);
          // result is from White's perspective; bot is Black.
          say(r.result === "0-1" ? "win" : r.result === "1-0" ? "lose" : "draw");
        } else if (r.check) {
          say("botCheck");
        } else if (r.captured) {
          say("botCapture");
        }
      }
      setThinking(false);
    } finally {
      botRunningRef.current = false;
    }
  }, [fen, getBestMove, say]);

  useEffect(() => {
    if (thinking) runBot();
  }, [thinking, runBot]);

  const handleUserMove = useCallback(
    (uci: string) => {
      if (result || thinking || !isUserTurn) return;
      const r = makeMove(fen, uci);
      if (!r) return;
      setFen(r.fen);
      setMoves((prev) => [...prev, { uci, san: r.san }]);
      if (r.over) {
        setResult(r.result);
        setReason(r.reason);
        say(r.result === "1-0" ? "lose" : r.result === "0-1" ? "win" : "draw");
      } else {
        if (r.check) say("userCheck");
        else if (r.captured) say("userCapture");
        else if (seedRef.current % 3 === 0) say("banter");
        else seedRef.current++; // keep variety advancing even when silent
        setThinking(true);
      }
    },
    [fen, result, thinking, isUserTurn, say]
  );

  const takeBack = useCallback(() => {
    if (thinking || moves.length === 0) return;
    const drop = moves.length >= 2 ? 2 : 1;
    const next = moves.slice(0, moves.length - drop);
    setMoves(next);
    setFen(replayFen(next.map((m) => m.uci)));
    setResult(null);
    setReason(null);
  }, [moves, thinking]);

  const resign = useCallback(() => {
    if (result) return;
    setResult("0-1");
    setReason("You resigned");
    setThinking(false);
    say("win");
  }, [result, say]);

  const resultTitle =
    result === "1-0" ? "You won" : result === "0-1" ? "You lost" : result ? "Draw" : "";

  return (
    <VStack align="stretch" gap={{ base: 6, md: 8 }} maxW="5xl" mx="auto">
      {/* Heading */}
      <VStack align={{ base: "center", md: "flex-start" }} gap={2} textAlign={{ base: "center", md: "left" }}>
        <HStack px={3} py={1.5} borderRadius="full" bg="bgWarm" borderWidth="1px" borderColor="goldDark" gap={2}>
          <Box w="6px" h="6px" borderRadius="full" bg="accentGreen" />
          <Text fontSize="xs" color="gold" fontWeight="600" letterSpacing="0.08em" textTransform="uppercase">
            Free play · no sign-up
          </Text>
        </HStack>
        <Text as="h1" fontFamily="var(--font-playfair), Georgia, serif" fontSize={{ base: "3xl", md: "4xl" }} color="textPrimary" fontWeight="600" lineHeight="1.1">
          Choose your opponent
        </Text>
        <Text color="textSecondary" fontSize={{ base: "sm", md: "md" }} maxW="lg">
          Each bot has its own style — and a few things to say. Want to save games
          and earn a rating?{" "}
          <Link href="/register" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Create a free account
          </Link>
          .
        </Text>
      </VStack>

      {/* Persona picker */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3}>
        {BOT_PERSONAS.map((p) => {
          const active = p.id === personaId;
          return (
            <MotionBox
              key={p.id}
              as="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => newGame(p.id)}
              p={4}
              borderRadius="soft"
              textAlign="left"
              bg={active ? "bgWarm" : "bgCard"}
              borderWidth="1px"
              borderColor={active ? "gold" : "blackAlpha.200"}
              boxShadow={active ? "var(--shadow-card-soft)" : "none"}
              style={{ transition: "border-color 0.18s, background-color 0.18s, box-shadow 0.18s" }}
              _hover={{ borderColor: "gold" }}
            >
              <HStack gap={3} align="center">
                <Box fontSize="2xl" lineHeight="1">
                  {p.avatar}
                </Box>
                <Box>
                  <Text fontWeight="700" color={active ? "gold" : "textPrimary"} fontSize="md" lineHeight="1.1">
                    {p.name}
                  </Text>
                  <Text fontSize="2xs" color="textMuted">
                    {p.level} · ~{p.elo}
                  </Text>
                </Box>
              </HStack>
              <Text fontSize="xs" color="textSecondary" mt={2} lineHeight="1.4">
                {p.tagline}
              </Text>
            </MotionBox>
          );
        })}
      </SimpleGrid>

      {/* Board + chat rail */}
      <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 5, lg: 8 }} align="flex-start">
        <VStack gap={3} flex="0 0 auto" w="full" maxW={{ lg: "560px" }} mx="auto">
          <Nameplate label={`${persona.avatar}  ${persona.name}`} colour="black" highlight={thinking} sub={thinking ? "thinking…" : warming ? "warming up…" : undefined} />
          <Box w="full">
            <GameBoard
              fen={fen}
              orientation={orientation}
              isMyTurn={isUserTurn && !result && !thinking}
              onMove={handleUserMove}
              allowMove={!result && !thinking}
            />
          </Box>
          <Nameplate label="You" colour="white" highlight={isUserTurn && !result && !thinking} />
        </VStack>

        <VStack align="stretch" gap={4} flex="1 1 260px" minW="0" w="full">
          {/* Controls */}
          <HStack gap={2} flexWrap="wrap">
            <ActionButton onClick={() => newGame()} primary>
              New game
            </ActionButton>
            <ActionButton onClick={takeBack} disabled={thinking || moves.length === 0}>
              Take back
            </ActionButton>
            <ActionButton onClick={resign} disabled={!!result}>
              Resign
            </ActionButton>
          </HStack>

          {/* Chat */}
          <Box borderWidth="1px" borderColor="blackAlpha.200" borderRadius="soft" bg="bgCard" overflow="hidden">
            <HStack px={4} py={2.5} borderBottomWidth="1px" borderColor="blackAlpha.100" gap={2}>
              <Box fontSize="lg">{persona.avatar}</Box>
              <Text fontWeight="700" color="textPrimary" fontSize="sm">
                {persona.name}
              </Text>
              <Text fontSize="2xs" color="textMuted">
                says
              </Text>
            </HStack>
            <VStack align="stretch" gap={2} px={4} py={3} maxH="240px" overflowY="auto">
              {chat.map((m) => (
                <HStack key={m.id} align="flex-start" gap={2}>
                  <Box fontSize="md" lineHeight="1.3" flexShrink={0}>
                    {persona.avatar}
                  </Box>
                  <Box bg="bgWarm" borderRadius="lg" px={3} py={2}>
                    <Text fontSize="sm" color="textPrimary" lineHeight="1.4">
                      {m.text}
                    </Text>
                  </Box>
                </HStack>
              ))}
              <div ref={chatEndRef} />
            </VStack>
          </Box>

          {/* Compact move strip */}
          <Box borderWidth="1px" borderColor="blackAlpha.200" borderRadius="soft" bg="bgCard" px={4} py={3}>
            <Text fontSize="2xs" color="textMuted" letterSpacing="0.18em" textTransform="uppercase" mb={1.5}>
              Moves · {moves.length}
            </Text>
            {moves.length === 0 ? (
              <Text color="textMuted" fontSize="sm" fontStyle="italic">
                Make the first move.
              </Text>
            ) : (
              <Flex gap={1.5} flexWrap="wrap" maxH="90px" overflowY="auto">
                {moves.map((m, i) => (
                  <Text key={i} fontSize="sm" color="textSecondary">
                    {i % 2 === 0 && (
                      <Text as="span" color="textMuted" mr={1}>
                        {Math.floor(i / 2) + 1}.
                      </Text>
                    )}
                    {m.san}
                  </Text>
                ))}
              </Flex>
            )}
          </Box>
        </VStack>
      </Flex>

      {/* Game over */}
      {result && (
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          borderWidth="1px"
          borderColor="gold"
          borderRadius="soft"
          bg="bgWarm"
          p={{ base: 5, md: 6 }}
          textAlign="center"
        >
          <Text fontSize="2xs" color="textMuted" letterSpacing="0.2em" textTransform="uppercase">
            {reason}
          </Text>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize={{ base: "3xl", md: "4xl" }} color="gold" fontWeight="600" mt={1}>
            {resultTitle}
          </Text>
          <HStack mt={4} gap={3} justify="center" flexWrap="wrap">
            <ActionButton onClick={() => newGame()} primary>
              Play again
            </ActionButton>
            <Link href="/register">
              <ActionButton>Save your games — sign up free →</ActionButton>
            </Link>
          </HStack>
        </MotionBox>
      )}
    </VStack>
  );
}

/* ───────────────── small presentational helpers ───────────────── */

function ActionButton({
  children,
  onClick,
  primary,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="sm"
      px={5}
      borderRadius="soft"
      fontWeight="600"
      bg={primary ? "gold" : "bgCard"}
      color={primary ? "white" : "textPrimary"}
      borderWidth="1px"
      borderColor={primary ? "gold" : "blackAlpha.200"}
      _hover={primary ? { bg: "goldLight" } : { borderColor: "gold", color: "gold" }}
      _active={disabled ? undefined : { transform: "scale(0.96)" }}
      _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
      transition="all 0.15s"
    >
      {children}
    </Button>
  );
}

function Nameplate({
  label,
  colour,
  highlight,
  sub,
}: {
  label: string;
  colour: "white" | "black";
  highlight: boolean;
  sub?: string;
}) {
  return (
    <HStack
      w="full"
      maxW="560px"
      justify="space-between"
      px={4}
      py={2.5}
      borderRadius="soft"
      bg="bgCard"
      borderWidth="1px"
      borderColor={highlight ? "gold" : "blackAlpha.200"}
      boxShadow={highlight ? "var(--shadow-card-soft)" : "none"}
      transition="all 0.2s"
    >
      <HStack gap={3}>
        <Box w="12px" h="12px" borderRadius="full" bg={colour === "white" ? "#FFFFFF" : "#1A2530"} borderWidth="1px" borderColor="blackAlpha.300" />
        <Text fontWeight="600" color="textPrimary" fontSize="md">
          {label}
        </Text>
      </HStack>
      {sub && (
        <Text fontSize="xs" color="gold" fontWeight="600" letterSpacing="0.04em">
          {sub}
        </Text>
      )}
    </HStack>
  );
}
