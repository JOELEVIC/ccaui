"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Box, Button, Text, VStack, HStack, Flex, SimpleGrid, Heading, Switch } from "@chakra-ui/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { PremiumModal } from "@/components/chess-pro/PremiumModal";
import { toaster } from "@/lib/toaster";
import { Chess } from "chess.js";
import { useAuth } from "@/lib/auth";
import { GameBoard, type PendingPremove } from "@/components/chess/GameBoard";
import { isPremoveStillValid } from "@/lib/chessPremoves";
import { isCaptureByFenChange, playCaptureSound, playMoveSound } from "@/lib/chessSounds";
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
import { parseMoveTokens } from "@/lib/gameMoveParsing";
import {
  fenAfterMoves,
  hasMoveReviewData,
  parseGameAnalysis,
  sanToArrow,
} from "@/lib/gameAnalysisReview";
import { GameOverDialog } from "@/components/chess/GameOverDialog";
import type { Arrow } from "react-chessboard";

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
  const parts = parseMoveTokens(moves ?? "");
  for (const m of parts) {
    try {
      chess.move(m);
    } catch {
      break;
    }
  }
  return chess.fen();
}

function lastMoveSquares(moves: string): { from: string; to: string } | null {
  const chess = new Chess();
  const parts = parseMoveTokens(moves ?? "");
  if (parts.length === 0) return null;
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

const LS_PREMOVE = "dchess-game-premove";
const LS_SOUNDS = "dchess-game-sounds";

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

function resultToScore(result: string | null | undefined): string {
  if (result === "WHITE_WIN") return "1 – 0";
  if (result === "BLACK_WIN") return "0 – 1";
  if (result === "DRAW" || result === "STALEMATE") return "½ – ½";
  return "—";
}

function GamePageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { user, token } = useAuth();
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [status, setStatus] = useState<string>("PENDING");
  const [result, setResult] = useState<string | null>(null);
  const [drawOfferBy, setDrawOfferBy] = useState<string | null>(null);
  const [movePending, setMovePending] = useState(false);
  const submittingMoveRef = useRef(false);
  const prevFenForSoundRef = useRef<string | null>(null);
  const [premoveEnabled, setPremoveEnabled] = useState(() => readStoredBool(LS_PREMOVE, false));
  const [soundsEnabled, setSoundsEnabled] = useState(() => readStoredBool(LS_SOUNDS, true));
  const [pendingPremove, setPendingPremove] = useState<PendingPremove | null>(null);
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
  const [gameOverModalDismissed, setGameOverModalDismissed] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);
  const analysis = game ? parseGameAnalysis(game.analysisJson) : null;
  const lastSq = game ? lastMoveSquares(game.moves ?? "") : null;
  const isParticipant = user && game && (game.white?.id === user.id || game.black?.id === user.id);
  const isWhite = user && game?.white?.id === user.id;
  const orientation = isWhite ? "white" : "black";
  const myColor = isWhite ? "w" : "b";
  const turnIsWhite = fen.split(" ")[1] === "w";
  const isMyTurn = isWhite ? turnIsWhite : !turnIsWhite;
  const gameEnded = status === "COMPLETED" || status === "ABANDONED";
  const sanMoves = useMemo(() => parseMoveTokens(game?.moves ?? ""), [game?.moves]);
  const hasReview = hasMoveReviewData(analysis);
  const reviewCount = analysis?.moveReviews?.length ?? 0;

  useEffect(() => {
    setGameOverModalDismissed(false);
    setReviewMode(false);
    setReviewStep(0);
  }, [id]);

  const wantsReviewUrl = searchParams.get("review") === "1";

  useEffect(() => {
    if (!gameEnded || !wantsReviewUrl) return;
    if (hasMoveReviewData(analysis)) setReviewMode(true);
  }, [gameEnded, wantsReviewUrl, analysis]);

  const showGameOverModal = gameEnded && !gameOverModalDismissed && !wantsReviewUrl;
  const postGameStatsVisible = gameEnded && !showGameOverModal;

  const reviewBoardFen =
    reviewMode && sanMoves.length > 0
      ? fenAfterMoves(sanMoves, Math.min(reviewStep, sanMoves.length))
      : fen;

  const reviewRow =
    reviewMode && analysis?.moveReviews && reviewStep >= 0 && reviewStep < analysis.moveReviews.length
      ? analysis.moveReviews[reviewStep]
      : null;

  const { reviewArrows, reviewExtraSquares } = useMemo(() => {
    const empty = { reviewArrows: [] as Arrow[], reviewExtraSquares: {} as Record<string, React.CSSProperties> };
    if (!reviewMode || !reviewRow || reviewStep >= sanMoves.length) return empty;
    const posFen = fenAfterMoves(sanMoves, reviewStep);
    const arrows: Arrow[] = [];
    const squares: Record<string, React.CSSProperties> = {};
    const best = sanToArrow(posFen, reviewRow.bestSan);
    if (best) {
      arrows.push({
        startSquare: best.startSquare,
        endSquare: best.endSquare,
        color: "rgba(34, 197, 94, 0.95)",
      });
      squares[best.startSquare] = { backgroundColor: "rgba(34, 197, 94, 0.2)" };
      squares[best.endSquare] = { backgroundColor: "rgba(34, 197, 94, 0.28)" };
    }
    if (reviewRow.playedSan !== reviewRow.bestSan) {
      const played = sanToArrow(posFen, reviewRow.playedSan);
      if (played) {
        arrows.push({
          startSquare: played.startSquare,
          endSquare: played.endSquare,
          color: "rgba(230, 164, 82, 0.9)",
        });
        if (!squares[played.startSquare]) squares[played.startSquare] = { backgroundColor: "rgba(230, 164, 82, 0.15)" };
        if (!squares[played.endSquare]) squares[played.endSquare] = { backgroundColor: "rgba(230, 164, 82, 0.22)" };
      }
    }
    return { reviewArrows: arrows, reviewExtraSquares: squares };
  }, [reviewMode, reviewRow, reviewStep, sanMoves]);

  const enterReview = useCallback(() => {
    setGameOverModalDismissed(true);
    setReviewMode(true);
    setReviewStep(0);
    router.replace(`/game/${id}?review=1`, { scroll: false });
  }, [id, router]);

  const exitReview = useCallback(() => {
    setReviewMode(false);
    setReviewStep(0);
    router.replace(`/game/${id}`, { scroll: false });
  }, [id, router]);

  const dismissGameOverModal = useCallback(() => {
    setGameOverModalDismissed(true);
  }, []);

  useEffect(() => {
    if (!game) return;
    setFen(movesToFen(game.moves ?? ""));
    setStatus(game.status ?? "PENDING");
    setResult(game.result ?? null);
  }, [game]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PREMOVE, premoveEnabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [premoveEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SOUNDS, soundsEnabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [soundsEnabled]);

  useEffect(() => {
    if (!soundsEnabled || gameEnded) {
      prevFenForSoundRef.current = fen;
      return;
    }
    if (prevFenForSoundRef.current === null) {
      prevFenForSoundRef.current = fen;
      return;
    }
    if (prevFenForSoundRef.current === fen) return;
    if (isCaptureByFenChange(prevFenForSoundRef.current, fen)) playCaptureSound();
    else playMoveSound();
    prevFenForSoundRef.current = fen;
  }, [fen, soundsEnabled, gameEnded]);

  useEffect(() => {
    if (gameEnded) setPendingPremove(null);
  }, [gameEnded]);

  useEffect(() => {
    if (!isParticipant || !pendingPremove || isMyTurn) return;
    if (!isPremoveStillValid(fen, myColor, pendingPremove.from, pendingPremove.to)) {
      setPendingPremove(null);
    }
  }, [fen, isMyTurn, pendingPremove, isParticipant, myColor]);

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
    submittingMoveRef.current = false;
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
      if (!token || gameEnded) return;
      if (submittingMoveRef.current) return;
      submittingMoveRef.current = true;
      setMovePending(true);
      makeMove(token, id, move).catch((err) => {
        setMovePending(false);
        submittingMoveRef.current = false;
        toaster.create({ title: err?.message ?? "Move failed", type: "error" });
      });
    },
    [id, token, gameEnded]
  );

  useEffect(() => {
    if (!isParticipant || gameEnded || movePending || !isMyTurn || !pendingPremove) return;
    const chess = new Chess();
    try {
      chess.load(fen);
    } catch {
      setPendingPremove(null);
      return;
    }
    if (chess.turn() !== myColor) return;
    const promotion = (pendingPremove.promotion as "q" | "r" | "b" | "n" | undefined) || "q";
    let m;
    try {
      m = chess.move({
        from: pendingPremove.from,
        to: pendingPremove.to,
        promotion,
      });
    } catch {
      m = null;
    }
    if (!m) {
      setPendingPremove(null);
      return;
    }
    const uci = m.promotion ? `${m.from}${m.to}${m.promotion.toLowerCase()}` : `${m.from}${m.to}`;
    setPendingPremove(null);
    handleMove(uci);
  }, [isParticipant, gameEnded, movePending, isMyTurn, pendingPremove, fen, myColor, handleMove]);

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
            fen={reviewBoardFen}
            orientation={orientation}
            isMyTurn={!!isParticipant && !gameEnded && isMyTurn}
            movePending={movePending}
            onMove={handleMove}
            allowMove={!gameEnded && !!isParticipant}
            lastMove={reviewMode ? null : lastSq}
            premoveEnabled={premoveEnabled}
            pendingPremove={pendingPremove}
            onPendingPremove={setPendingPremove}
            extraSquareStyles={reviewMode ? reviewExtraSquares : undefined}
            reviewArrows={reviewMode ? reviewArrows : undefined}
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

        <VStack
          align="stretch"
          gap={4}
          minW={{ base: "200px", lg: 0 }}
          maxW={{ base: "100%", lg: "300px" }}
          w={{ base: "100%", lg: "100%" }}
          flexShrink={{ lg: 1 }}
        >
          <Box
            py={3}
            px={4}
            borderRadius="soft"
            borderWidth="1px"
            borderColor="goldDark"
            bg="bgCard"
          >
            <Text color="gold" fontSize="xs" fontWeight="600" mb={3}>
              Gameplay
            </Text>
            <VStack align="stretch" gap={3}>
              {isParticipant && !gameEnded && (
                <HStack justify="space-between" align="center">
                  <Text color="textSecondary" fontSize="sm">
                    Premove
                  </Text>
                  <Switch.Root
                    checked={premoveEnabled}
                    onCheckedChange={(e) => setPremoveEnabled(!!e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control bg={premoveEnabled ? "gold" : "bgSurface"} borderWidth="1px" borderColor="whiteAlpha.200">
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>
              )}
              <HStack justify="space-between" align="center">
                <Text color="textSecondary" fontSize="sm">
                  Sounds
                </Text>
                <Switch.Root
                  checked={soundsEnabled}
                  onCheckedChange={(e) => setSoundsEnabled(!!e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control bg={soundsEnabled ? "gold" : "bgSurface"} borderWidth="1px" borderColor="whiteAlpha.200">
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </HStack>
            </VStack>
          </Box>
          <MaterialDisplay fen={reviewBoardFen} />
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
            <Flex
              gap={2}
              flexWrap="wrap"
              overflowY="auto"
              maxW="100%"
              pb={1}
              css={{ scrollbarWidth: "thin" }}
            >
              {sanMoves.map((m, i) => (
                <Text
                  key={i}
                  color={
                    reviewMode && (i === reviewStep || (reviewStep === sanMoves.length && i === sanMoves.length - 1))
                      ? "gold"
                      : "textSecondary"
                  }
                  fontWeight={
                    reviewMode && (i === reviewStep || (reviewStep === sanMoves.length && i === sanMoves.length - 1))
                      ? "700"
                      : "normal"
                  }
                  fontSize="sm"
                  whiteSpace="nowrap"
                  flexShrink={0}
                  cursor={reviewMode && hasReview ? "pointer" : undefined}
                  onClick={reviewMode && hasReview ? () => setReviewStep(i) : undefined}
                >
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                  {m}
                </Text>
              ))}
              {sanMoves.length === 0 && (
                <Text color="textMuted" fontSize="sm">—</Text>
              )}
            </Flex>
          </Box>

          {reviewMode && hasReview && (
            <Box
              py={3}
              px={4}
              borderRadius="soft"
              borderWidth="1px"
              borderColor="purple.400"
              bg="bgCard"
            >
              <Text color="gold" fontSize="xs" fontWeight="700" mb={2}>
                Move review
              </Text>
              <Text color="textMuted" fontSize="xs" mb={2}>
                Green arrow = best move · Gold = played (when different)
              </Text>
              <HStack flexWrap="wrap" gap={1} mb={3}>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="goldDark"
                  color="textSecondary"
                  borderRadius="soft"
                  onClick={() => setReviewStep(0)}
                  disabled={reviewStep === 0}
                >
                  Start
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="goldDark"
                  color="textSecondary"
                  borderRadius="soft"
                  onClick={() => setReviewStep((s) => Math.max(0, s - 1))}
                  disabled={reviewStep === 0}
                >
                  Prev
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="goldDark"
                  color="textSecondary"
                  borderRadius="soft"
                  onClick={() => setReviewStep((s) => Math.min(sanMoves.length, s + 1))}
                  disabled={reviewStep >= sanMoves.length}
                >
                  Next
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="goldDark"
                  color="textSecondary"
                  borderRadius="soft"
                  onClick={() => setReviewStep(sanMoves.length)}
                  disabled={reviewStep >= sanMoves.length}
                >
                  End
                </Button>
              </HStack>
              {reviewStep >= sanMoves.length ? (
                <Text color="textSecondary" fontSize="sm">
                  Final position — end of game.
                </Text>
              ) : reviewRow ? (
                <VStack align="stretch" gap={1}>
                  <Text color="textSecondary" fontSize="sm">
                    <Text as="span" fontWeight="700" color="textPrimary">
                      {reviewStep % 2 === 0 ? "White" : "Black"}
                    </Text>{" "}
                    played{" "}
                    <Text as="span" color="gold" fontWeight="700">
                      {reviewRow.playedSan}
                    </Text>
                  </Text>
                  <Text color="textSecondary" fontSize="sm">
                    Best:{" "}
                    <Text as="span" color="green.400" fontWeight="700">
                      {reviewRow.bestSan}
                    </Text>
                    {reviewRow.playedSan === reviewRow.bestSan ? (
                      <Text as="span" color="textMuted" fontSize="xs" ml={1}>
                        (same move)
                      </Text>
                    ) : null}
                  </Text>
                </VStack>
              ) : (
                <Text color="textMuted" fontSize="sm">
                  No best-move data for this ply.
                </Text>
              )}
              <Button mt={3} size="sm" width="full" variant="outline" borderColor="gold" color="gold" borderRadius="soft" onClick={exitReview}>
                Exit review
              </Button>
            </Box>
          )}

          {gameEnded && hasReview && !reviewMode && (
            <Button size="sm" bg="gold" color="bgDark" borderRadius="soft" onClick={enterReview}>
              Review moves
            </Button>
          )}

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

      {gameEnded && game && postGameStatsVisible && (
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

      <GameOverDialog
        open={showGameOverModal}
        onDismiss={dismissGameOverModal}
        onReview={enterReview}
        resultLabel={resultToScore(result)}
        resultDetail={result ? `${result} · ${status}` : status}
        hasReviewData={hasReview}
      />

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </Box>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <Box minH="100vh" bg="bgDark" display="flex" alignItems="center" justifyContent="center">
          <Text color="gold">Loading game...</Text>
        </Box>
      }
    >
      <GamePageInner />
    </Suspense>
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
