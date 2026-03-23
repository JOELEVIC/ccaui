"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Box, Button, Text, VStack, HStack, Flex, SimpleGrid, Heading } from "@chakra-ui/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { PremiumModal } from "@/components/chess-pro/PremiumModal";
import { toaster } from "@/lib/toaster";
import { Chess } from "chess.js";
import { useAuth } from "@/lib/auth";
import { GameBoard } from "@/components/chess/GameBoard";
import { MaterialDisplay } from "@/components/chess/MaterialDisplay";
import { RECORD_GAME_COMPLETED } from "@/graphql/mutations/games";
import {
  startGameSession,
  makeMove,
  resignGame,
  offerDraw,
  acceptDraw,
  rejectDraw,
  type GameUpdatePayload,
} from "@/lib/game-api";
import { useGameSubscription } from "@/lib/useGameSubscription";

const GAME_QUERY = gql`
  query GamePage($id: ID!) {
    game(id: $id) {
      id
      status
      result
      moves
      timeControl
      analysisJson
      white {
        id
        username
        rating
      }
      black {
        id
        username
        rating
      }
    }
  }
`;

function movesToFen(moves: string): string {
  const chess = new Chess();
  if (moves?.trim()) {
    const parts = moves.trim().split(/\s+/);
    for (const m of parts) {
      try {
        chess.move(m);
      } catch {
        break;
      }
    }
  }
  return chess.fen();
}

function lastMoveSquares(moves: string): { from: string; to: string } | null {
  const chess = new Chess();
  if (!moves?.trim()) return null;
  const parts = moves.trim().split(/\s+/);
  let last: { from: string; to: string } | null = null;
  for (const m of parts) {
    try {
      const mv = chess.move(m);
      if (mv) last = { from: mv.from, to: mv.to };
    } catch {
      break;
    }
  }
  return last;
}

interface StoredAnalysis {
  white: { inaccuracies: number; mistakes: number; blunders: number; acpl: number };
  black: { inaccuracies: number; mistakes: number; blunders: number; acpl: number };
  evalSeries: { ply: number; cp: number }[];
}

function parseAnalysis(json: string | null | undefined): StoredAnalysis | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as StoredAnalysis;
  } catch {
    return null;
  }
}

function resultToScore(result: string | null | undefined): string {
  if (result === "WHITE_WIN") return "1 – 0";
  if (result === "BLACK_WIN") return "0 – 1";
  if (result === "DRAW" || result === "STALEMATE") return "½ – ½";
  return "—";
}

export default function GamePage() {
  const params = useParams();
  const id = params.id as string;
  const { user, token } = useAuth();
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [status, setStatus] = useState<string>("PENDING");
  const [result, setResult] = useState<string | null>(null);
  const [drawOfferBy, setDrawOfferBy] = useState<string | null>(null);
  const [movePending, setMovePending] = useState(false);
  const startSessionDone = useRef(false);
  const recordedXpRef = useRef(false);
  const [recordGameCompleted] = useMutation<{ recordGameCompleted: { xpAwarded: number } }>(RECORD_GAME_COMPLETED);

  const { data, loading } = useQuery<{
    game: {
      id: string;
      status: string;
      result?: string | null;
      moves: string;
      timeControl: string;
      analysisJson?: string | null;
      white: { id: string; username: string; rating: number };
      black: { id: string; username: string; rating: number };
    };
  }>(GAME_QUERY, {
    variables: { id },
    skip: !id,
  });

  const game = data?.game;
  const [premiumOpen, setPremiumOpen] = useState(false);
  const analysis = game ? parseAnalysis(game.analysisJson) : null;
  const lastSq = game ? lastMoveSquares(game.moves ?? "") : null;
  const isParticipant = user && game && (game.white?.id === user.id || game.black?.id === user.id);
  const isWhite = user && game?.white?.id === user.id;
  const orientation = isWhite ? "white" : "black";
  const turnIsWhite = fen.split(" ")[1] === "w";
  const isMyTurn = isWhite ? turnIsWhite : !turnIsWhite;
  const gameEnded = status === "COMPLETED" || status === "ABANDONED";
  const moveListFromFen = (() => {
    const c = new Chess();
    try {
      c.load(fen);
    } catch {
      return [];
    }
    return c.history();
  })();

  useEffect(() => {
    if (!game) return;
    setFen(movesToFen(game.moves ?? ""));
    setStatus(game.status ?? "PENDING");
    setResult(game.result ?? null);
  }, [game]);

  // Start CCA game session when game is loaded and user is participant (once per mount)
  useEffect(() => {
    if (!game || !token || !isParticipant || startSessionDone.current) return;
    const whiteId = game.white?.id;
    const blackId = game.black?.id;
    if (!whiteId || !blackId || !game.timeControl) return;
    startSessionDone.current = true;
    startGameSession(token, id, whiteId, blackId, game.timeControl)
      .then(() => {})
      .catch((err) => {
        startSessionDone.current = false;
        toaster.create({ title: err?.message ?? "Failed to start live session", type: "error" });
      });
  }, [id, game, token, isParticipant]);

  const handleSubscriptionPayload = useCallback((payload: GameUpdatePayload) => {
    setFen(movesToFen(payload.moves ?? ""));
    setStatus(payload.status);
    if (payload.result != null) setResult(payload.result);
    if (payload.drawOfferBy != null) setDrawOfferBy(payload.drawOfferBy);
    else setDrawOfferBy(null);
    if (payload.event === "GAME_END") {
      toaster.create({ title: "Game ended", type: "info" });
    }
    setMovePending(false);
  }, []);

  const { connected, error: subError } = useGameSubscription(
    isParticipant ? id : null,
    isParticipant ? token : null,
    handleSubscriptionPayload
  );

  useEffect(() => {
    if (subError) toaster.create({ title: subError, type: "error" });
  }, [subError]);

  // Record XP once when viewing a completed game as participant
  useEffect(() => {
    if (!id || !user?.id || status !== "COMPLETED" || !isParticipant || recordedXpRef.current) return;
    recordedXpRef.current = true;
    recordGameCompleted({ variables: { gameId: id } })
      .then(({ data }) => {
        const xp = data?.recordGameCompleted?.xpAwarded;
        if (xp != null && xp > 0) {
          toaster.create({ title: `+${xp} XP`, type: "success" });
        }
      })
      .catch(() => {});
  }, [id, user?.id, status, isParticipant, recordGameCompleted]);

  const handleMove = useCallback(
    (move: string) => {
      if (!token || movePending || gameEnded) return;
      setMovePending(true);
      makeMove(token, id, move).catch((err) => {
        setMovePending(false);
        toaster.create({ title: err?.message ?? "Move failed", type: "error" });
      });
    },
    [id, token, movePending, gameEnded]
  );

  const handleResign = () => {
    if (!confirm("Resign this game?")) return;
    if (!token) return;
    resignGame(token, id).catch((err) =>
      toaster.create({ title: err?.message ?? "Resign failed", type: "error" })
    );
  };

  const handleOfferDraw = () => {
    if (!token) return;
    offerDraw(token, id).catch((err) =>
      toaster.create({ title: err?.message ?? "Offer draw failed", type: "error" })
    );
  };

  const handleAcceptDraw = () => {
    if (!token) return;
    acceptDraw(token, id).catch((err) =>
      toaster.create({ title: err?.message ?? "Accept draw failed", type: "error" })
    );
  };

  const handleRejectDraw = () => {
    if (!token) return;
    rejectDraw(token, id).catch((err) =>
      toaster.create({ title: err?.message ?? "Reject draw failed", type: "error" })
    );
  };

  const opponentOfferedDraw = drawOfferBy && drawOfferBy !== user?.id;
  const iOfferedDraw = drawOfferBy === user?.id;

  if (loading && !game) {
    return (
      <Box minH="100vh" bg="bgDark" display="flex" alignItems="center" justifyContent="center">
        <Text color="gold">Loading game...</Text>
      </Box>
    );
  }

  if (!game) {
    return (
      <Box minH="100vh" bg="bgDark" p={8}>
        <Text color="gold" fontSize="xl" fontWeight="600">
          Game not found
        </Text>
        <Link href="/games">
          <Button mt={4} color="gold" variant="outline" borderColor="gold" borderRadius="soft">
            Back to games
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bgDark" py={6} px={4}>
      {isParticipant && !connected && !gameEnded && (
        <Text color="statusWarning" fontSize="sm" textAlign="center" mb={2}>
          Connecting to live server…
        </Text>
      )}
      <Flex
        direction={{ base: "column", lg: "row" }}
        align="flex-start"
        justify="center"
        gap={6}
        maxW="1200px"
        mx="auto"
      >
        <VStack gap={2} align="stretch" flexShrink={0}>
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
              {orientation === "white" ? game.black?.username : game.white?.username}
            </Text>
            <Text color="textMuted" fontSize="xs">
              {orientation === "white" ? game.black?.rating : game.white?.rating}
            </Text>
          </Box>

          <GameBoard
            fen={fen}
            orientation={orientation}
            isMyTurn={isMyTurn && !gameEnded && !movePending}
            onMove={handleMove}
            allowMove={!gameEnded && !!isParticipant}
            lastMove={lastSq}
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
            <Text color="textSecondary" fontSize="sm">
              {orientation === "white" ? game.white?.username : game.black?.username}
            </Text>
            <Text color="textMuted" fontSize="xs">
              {orientation === "white" ? game.white?.rating : game.black?.rating}
            </Text>
          </Box>
        </VStack>

        <VStack align="stretch" gap={4} minW="200px">
          <MaterialDisplay fen={fen} />
          <Box
            py={3}
            px={4}
            borderRadius="soft"
            borderWidth="1px"
            borderColor="goldDark"
            bg="bgCard"
            textAlign="center"
          >
            <Text color="textMuted" fontSize="xs" mb={1}>
              Time control
            </Text>
            <Text color="gold" fontWeight="700" fontSize="lg">
              {game.timeControl}
            </Text>
            <Text color="textMuted" fontSize="xs" mt={1}>
              {status}
              {result && ` · ${result}`}
            </Text>
          </Box>
          <Box
            py={3}
            px={4}
            borderRadius="soft"
            borderWidth="1px"
            borderColor="goldDark"
            bg="bgCard"
            maxH="300px"
            overflowY="auto"
          >
            <Text color="gold" fontSize="xs" fontWeight="600" mb={2}>
              Moves
            </Text>
            <Flex gap={2} flexWrap="nowrap" overflowX="auto" pb={1} css={{ scrollbarWidth: "thin" }}>
              {moveListFromFen.map((m, i) => (
                <Text key={i} color="textSecondary" fontSize="sm" whiteSpace="nowrap" flexShrink={0}>
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                  {m}
                </Text>
              ))}
              {moveListFromFen.length === 0 && (
                <Text color="textMuted" fontSize="sm">—</Text>
              )}
            </Flex>
          </Box>
          {opponentOfferedDraw && !gameEnded && (
            <HStack gap={2}>
              <Text color="gold" fontSize="sm">Draw offered</Text>
              <Button size="sm" colorScheme="green" borderRadius="soft" onClick={handleAcceptDraw}>
                Accept
              </Button>
              <Button size="sm" variant="outline" borderColor="gold" color="gold" borderRadius="soft" onClick={handleRejectDraw}>
                Reject
              </Button>
            </HStack>
          )}
          {iOfferedDraw && !gameEnded && (
            <Text color="textMuted" fontSize="sm">Draw offered (waiting for response)</Text>
          )}
        </VStack>
      </Flex>

      <HStack justify="center" gap={4} mt={6} flexWrap="wrap">
        {isParticipant && !gameEnded && (
          <>
            <Button
              size="sm"
              variant="outline"
              borderColor="goldDark"
              color="textSecondary"
              borderRadius="soft"
              _hover={{ color: "gold" }}
              onClick={handleOfferDraw}
              disabled={!!drawOfferBy}
            >
              Offer draw
            </Button>
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
            <Link href="/analysis">
              <Button
                size="sm"
                variant="outline"
                borderColor="gold"
                color="gold"
                borderRadius="soft"
              >
                Analyze
              </Button>
            </Link>
          </>
        )}
        <Link href="/games">
          <Button size="sm" variant="ghost" color="textMuted" borderRadius="soft">
            Back to games
          </Button>
        </Link>
      </HStack>

      {!isParticipant && (
        <Text color="textMuted" textAlign="center" mt={4} fontSize="sm">
          You are not a participant in this game.
        </Text>
      )}

      {gameEnded && game && (
        <VStack align="stretch" gap={6} maxW="900px" mx="auto" mt={10} px={2}>
          <Heading textAlign="center" fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary" size="lg">
            Game review
          </Heading>
          <Text textAlign="center" fontSize="4xl" fontWeight="800" color="gold">
            {resultToScore(result)}
          </Text>
          {analysis && (
            <>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100">
                  <Text color="gold" fontWeight="700" mb={2}>
                    {game.white.username}
                  </Text>
                  <StatRow label="Inaccuracies" value={analysis.white.inaccuracies} />
                  <StatRow label="Mistakes" value={analysis.white.mistakes} />
                  <StatRow label="Blunders" value={analysis.white.blunders} />
                  <StatRow label="Avg centipawn loss" value={analysis.white.acpl} />
                </Box>
                <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100">
                  <Text color="gold" fontWeight="700" mb={2}>
                    {game.black.username}
                  </Text>
                  <StatRow label="Inaccuracies" value={analysis.black.inaccuracies} />
                  <StatRow label="Mistakes" value={analysis.black.mistakes} />
                  <StatRow label="Blunders" value={analysis.black.blunders} />
                  <StatRow label="Avg centipawn loss" value={analysis.black.acpl} />
                </Box>
              </SimpleGrid>
              <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100" h="220px">
                <Text fontSize="xs" color="textMuted" mb={2}>
                  Evaluation (opening · middlegame · endgame)
                </Text>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={analysis.evalSeries.map((e) => ({ ply: e.ply, cp: e.cp }))}>
                    <XAxis dataKey="ply" tick={{ fill: "#6b728e", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#6b728e", fontSize: 10 }} />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#ffffff33" />
                    <Area type="monotone" dataKey="cp" stroke="#e6a452" fill="#e6a452" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
          <Button
            bg="gold"
            color="bgDark"
            borderRadius="soft"
            size="lg"
            onClick={() => setPremiumOpen(true)}
          >
            View detailed game performance →
          </Button>
        </VStack>
      )}

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </Box>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <HStack justify="space-between" py={1}>
      <Text fontSize="sm" color="textSecondary">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="700" color="textPrimary">
        {value}
      </Text>
    </HStack>
  );
}
