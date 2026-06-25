"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Box, Button, Text, VStack, HStack, Flex, SimpleGrid, Heading } from "@chakra-ui/react";
import { EvalGraph } from "@/components/chess/EvalGraph";
import { PremiumModal } from "@/components/chess-pro/PremiumModal";
import { toaster } from "@/lib/toaster";
import { Chess } from "chess.js";
import { useAuth } from "@/lib/auth";
import { GameBoard, type PendingPremove } from "@/components/chess/GameBoard";
import { BOARD_THEMES, type BoardThemeKey } from "@/components/chess/GameBoard";
import { isPremoveStillValid } from "@/lib/chessPremoves";
import { isCaptureByFenChange, playCaptureSound, playMoveSound } from "@/lib/chessSounds";
import { MaterialDisplay } from "@/components/chess/MaterialDisplay";
import { RECORD_GAME_COMPLETED } from "@/graphql/mutations/games";
import {
  startGameSession,
  makeMove,
  resignGame,
  abortGame,
  offerDraw,
  acceptDraw,
  rejectDraw,
  sendChatMessage,
  type GameUpdatePayload,
} from "@/lib/game-api";
import { useGameSubscription } from "@/lib/useGameSubscription";
import { LiveClock } from "@/components/chess/LiveClock";
import { GameChat, type ChatMsg } from "@/components/chess/GameChat";
import { parseMoveTokens } from "@/lib/gameMoveParsing";
import {
  fenAfterMoves,
  parseGameAnalysis,
  sanToArrow,
  CLASSIFICATION_META,
  type SideStats,
} from "@/lib/gameAnalysisReview";
import { useGameAnalysis } from "@/lib/useGameAnalysis";
import { EvaluationBar } from "@/components/chess/EvaluationBar";
import { CREATE_CHALLENGE } from "@/graphql/challenges";
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
      rated
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

/** Half-moves (plies) played, derived from a FEN's side-to-move + fullmove number. */
function plyFromFen(fen: string): number {
  const parts = fen.split(" ");
  const active = parts[1];
  const fullmove = parseInt(parts[5] ?? "1", 10) || 1;
  return (fullmove - 1) * 2 + (active === "b" ? 1 : 0);
}

/** Apply a UCI move (e2e4 / e7e8q) to a FEN, returning the resulting FEN or null if illegal. */
function applyUciToFen(fen: string, uci: string): string | null {
  const chess = new Chess();
  try {
    chess.load(fen);
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: (uci.slice(4) || "q") as "q" | "r" | "b" | "n",
    });
    return move ? chess.fen() : null;
  } catch {
    return null;
  }
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
const LS_BOARD_THEME = "dchess-board-theme";

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

function readStoredStr(key: string, defaultVal: string): string {
  if (typeof window === "undefined") return defaultVal;
  try {
    return localStorage.getItem(key) ?? defaultVal;
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

/** Human-readable game-over line from the server result + reason. */
function describeGameEnd(result: string | null | undefined, reason: string | null | undefined): string {
  const r = (reason ?? "").toLowerCase();
  if (r.includes("abort")) return "Game aborted — no rating change";
  if (result === "DRAW" || result === "STALEMATE") {
    if (r.includes("stalemate")) return "Draw — stalemate";
    if (r.includes("agreement")) return "Draw agreed";
    if (r.includes("repetition")) return "Draw — threefold repetition";
    if (r.includes("fifty")) return "Draw — fifty-move rule";
    if (r.includes("insufficient")) return "Draw — insufficient material";
    return "Draw";
  }
  const winner = result === "WHITE_WIN" ? "White" : result === "BLACK_WIN" ? "Black" : null;
  if (!winner) return "Game over";
  if (r.includes("checkmate")) return `${winner} wins by checkmate`;
  if (r.includes("timeout")) return `${winner} wins on time`;
  if (r.includes("resign")) return `${winner} wins — opponent resigned`;
  if (r.includes("abandon")) return `${winner} wins — opponent left`;
  return `${winner} wins`;
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
  // Optimistic move: locally-predicted FEN shown instantly, before the server echoes it back.
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null);
  const optimisticPlyRef = useRef<number | null>(null);
  // Live clocks: anchored remaining time + the client timestamp it was received at (skew-free countdown).
  const [clock, setClock] = useState<{ whiteMs: number; blackMs: number; anchorAt: number } | null>(null);
  // In-game chat (players + spectators).
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const chatIdRef = useRef(0);
  // The authoritative move list during live play comes from the subscription (ccanext's
  // game.moves only fills in at game end), so track it here and prefer it when present.
  const [liveMoves, setLiveMoves] = useState<string>("");
  // Presence countdown: opponent disconnected (forfeit) or the opening auto-abort window.
  const [awayInfo, setAwayInfo] = useState<{ deadline: number; kind: "abandon" | "abort" } | null>(null);
  const applyClocks = useCallback((s: { whiteMs?: number | null; blackMs?: number | null }) => {
    if (s.whiteMs == null || s.blackMs == null) return;
    setClock({ whiteMs: s.whiteMs, blackMs: s.blackMs, anchorAt: Date.now() });
  }, []);
  const prevFenForSoundRef = useRef<string | null>(null);
  const [premoveEnabled, setPremoveEnabled] = useState(() => readStoredBool(LS_PREMOVE, false));
  const [soundsEnabled, setSoundsEnabled] = useState(() => readStoredBool(LS_SOUNDS, true));
  const [boardTheme, setBoardTheme] = useState<BoardThemeKey>(
    () => readStoredStr(LS_BOARD_THEME, "classic") as BoardThemeKey
  );
  const [pendingPremove, setPendingPremove] = useState<PendingPremove | null>(null);
  const startSessionDone = useRef(false);
  const recordedXpRef = useRef(false);
  const [recordGameCompleted] = useMutation<{ recordGameCompleted: { xpAwarded: number } }>(RECORD_GAME_COMPLETED);
  const [createChallenge] = useMutation<{ createChallenge: { id: string } }>(CREATE_CHALLENGE);

  const { data, loading } = useQuery<{
    game: {
      id: string;
      status: string;
      result?: string | null;
      moves: string;
      timeControl: string;
      rated?: boolean;
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
  // Timeline scrub: null = following the live game / final position; a number = browsing that ply.
  const [viewPly, setViewPly] = useState<number | null>(null);
  const serverAnalysis = game ? parseGameAnalysis(game.analysisJson) : null;
  // In-browser Stockfish review; falls back to any stored server analysis.
  const review = useGameAnalysis();
  const analysis = review.analysis ?? serverAnalysis;
  // Live subscription moves win during play; fall back to the persisted moves for ended/historical games.
  const movesStr = liveMoves || game?.moves || "";
  const lastSq = movesStr ? lastMoveSquares(movesStr) : null;
  const isParticipant = user && game && (game.white?.id === user.id || game.black?.id === user.id);
  const isWhite = user && game?.white?.id === user.id;
  const orientation = isWhite ? "white" : "black";
  const myColor = isWhite ? "w" : "b";
  // The board the user actually sees: optimistic prediction if one is pending, else the confirmed FEN.
  const liveFen = optimisticFen ?? fen;
  const turnIsWhite = liveFen.split(" ")[1] === "w";
  const isMyTurn = isWhite ? turnIsWhite : !turnIsWhite;
  const gameEnded = status === "COMPLETED" || status === "ABANDONED";
  // Abort is available only before both players have moved; after that it's resign-only.
  const plies = plyFromFen(liveFen);
  const canAbort = !!isParticipant && !gameEnded && plies < 2;
  const turnColor: "w" | "b" = turnIsWhite ? "w" : "b";
  const topColor: "w" | "b" = orientation === "white" ? "b" : "w";
  const bottomColor: "w" | "b" = orientation === "white" ? "w" : "b";
  const clockRunning = (c: "w" | "b") => status === "ACTIVE" && !gameEnded && turnColor === c;
  const sanMoves = useMemo(() => parseMoveTokens(movesStr), [movesStr]);
  const canAnalyze = gameEnded && sanMoves.length > 0;
  // Timeline scrub state. browsing = viewing a past ply (board read-only); effStep = numeric position for nav.
  const browsing = viewPly !== null;
  const effStep = viewPly ?? sanMoves.length;

  useEffect(() => {
    setGameOverModalDismissed(false);
    setReviewMode(false);
    setViewPly(null);
  }, [id]);

  const wantsReviewUrl = searchParams.get("review") === "1";

  useEffect(() => {
    if (gameEnded && wantsReviewUrl) setReviewMode(true);
  }, [gameEnded, wantsReviewUrl]);

  const showGameOverModal = gameEnded && !gameOverModalDismissed && !wantsReviewUrl;
  const postGameStatsVisible = gameEnded && !showGameOverModal;

  // The board shows the browsed ply when scrubbing, else the live/final position.
  const boardFen =
    browsing && sanMoves.length > 0
      ? fenAfterMoves(sanMoves, Math.min(viewPly!, sanMoves.length))
      : liveFen;

  const reviewRow =
    browsing && analysis?.moveReviews && viewPly! >= 0 && viewPly! < analysis.moveReviews.length
      ? analysis.moveReviews[viewPly!]
      : null;

  // Eval (white POV) of the position currently shown, for the eval bar (when analysed).
  const reviewEval =
    analysis?.evalSeries && analysis.evalSeries.length > 0
      ? { cp: analysis.evalSeries[Math.min(effStep, analysis.evalSeries.length - 1)]?.cp ?? null, mate: null }
      : null;

  const { reviewArrows, reviewExtraSquares } = useMemo(() => {
    const empty = { reviewArrows: [] as Arrow[], reviewExtraSquares: {} as Record<string, React.CSSProperties> };
    if (!browsing || !reviewRow || viewPly! >= sanMoves.length) return empty;
    const posFen = fenAfterMoves(sanMoves, viewPly!);
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
  }, [browsing, reviewRow, viewPly, sanMoves]);

  const exitReview = useCallback(() => {
    setReviewMode(false);
    setViewPly(null);
    router.replace(`/game/${id}`, { scroll: false });
  }, [id, router]);

  const dismissGameOverModal = useCallback(() => {
    setGameOverModalDismissed(true);
  }, []);

  const reviewRunRef = useRef(review.run);
  reviewRunRef.current = review.run;
  // Enter review and kick off the in-browser Stockfish analysis (if not already done).
  const analyzeGame = useCallback(() => {
    setGameOverModalDismissed(true);
    setReviewMode(true);
    setViewPly(0);
    router.replace(`/game/${id}?review=1`, { scroll: false });
    if (sanMoves.length > 0) reviewRunRef.current(sanMoves);
  }, [id, router, sanMoves]);

  // Timeline navigation (works live + ended). null = follow the live game / final.
  const goLive = useCallback(() => setViewPly(null), []);
  const stepTo = useCallback(
    (n: number) => setViewPly(Math.max(0, Math.min(n, sanMoves.length))),
    [sanMoves.length]
  );
  const stepPrev = useCallback(() => setViewPly((p) => Math.max(0, (p ?? sanMoves.length) - 1)), [sanMoves.length]);
  const stepNext = useCallback(() => {
    setViewPly((p) => {
      const next = (p ?? sanMoves.length) + 1;
      return next >= sanMoves.length ? null : next;
    });
  }, [sanMoves.length]);

  // Rematch: challenge the same opponent again, swapping colours, same time control + mode.
  const handleRematch = useCallback(() => {
    if (!game || !user) return;
    const oppId = game.white?.id === user.id ? game.black?.id : game.white?.id;
    if (!oppId) return;
    // I had whatever colour; offer the opponent that colour so we swap.
    const iWasWhite = game.white?.id === user.id;
    const creatorColor = iWasWhite ? "black" : "white";
    createChallenge({
      variables: {
        input: { opponentId: oppId, creatorColor, timeControl: game.timeControl, rated: game.rated ?? true },
      },
    })
      .then(() => {
        const oppName = game.white?.id === user.id ? game.black?.username : game.white?.username;
        toaster.create({ title: `Rematch sent to ${oppName ?? "your opponent"}`, type: "success" });
        router.push("/games");
      })
      .catch((err) => toaster.create({ title: err?.message ?? "Couldn't send rematch", type: "error" }));
  }, [game, user, createChallenge, router]);

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
    try {
      localStorage.setItem(LS_BOARD_THEME, boardTheme);
    } catch {
      /* ignore */
    }
  }, [boardTheme]);

  useEffect(() => {
    if (!soundsEnabled || gameEnded) {
      prevFenForSoundRef.current = liveFen;
      return;
    }
    if (prevFenForSoundRef.current === null) {
      prevFenForSoundRef.current = liveFen;
      return;
    }
    if (prevFenForSoundRef.current === liveFen) return;
    if (isCaptureByFenChange(prevFenForSoundRef.current, liveFen)) playCaptureSound();
    else playMoveSound();
    prevFenForSoundRef.current = liveFen;
  }, [liveFen, soundsEnabled, gameEnded]);

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
      .then((s) => applyClocks(s))
      .catch((err) => {
        startSessionDone.current = false;
        toaster.create({ title: err?.message ?? "Failed to start live session", type: "error" });
      });
  }, [id, game, token, isParticipant, applyClocks]);

  const handleSubscriptionPayload = useCallback((payload: GameUpdatePayload) => {
    // Chat is delivered on the same channel — append and stop (it carries no move change).
    if (payload.event === "CHAT") {
      if (payload.chatUserId && payload.chatText) {
        const id = chatIdRef.current++;
        const userId = payload.chatUserId;
        const text = payload.chatText;
        setChatMessages((prev) => [...prev, { id, userId, text }]);
      }
      return;
    }
    // Presence countdowns — opponent disconnected (forfeit) or opening auto-abort armed.
    if (payload.event === "OPPONENT_LEFT") {
      if (payload.deadline) setAwayInfo({ deadline: payload.deadline, kind: "abandon" });
      return;
    }
    if (payload.event === "ABORT_ARMED") {
      if (payload.deadline) setAwayInfo({ deadline: payload.deadline, kind: "abort" });
      return;
    }
    if (payload.event === "OPPONENT_RETURNED") {
      setAwayInfo(null);
      return;
    }
    // Any real move or a game end makes a pending countdown moot.
    if (payload.event === "MOVE" || payload.event === "GAME_END") setAwayInfo(null);
    applyClocks(payload);
    setLiveMoves(payload.moves ?? "");
    const confirmedFen = movesToFen(payload.moves ?? "");
    setFen(confirmedFen);
    // Drop the optimistic prediction once the server has caught up to (or past) it,
    // so a stale GAME_STATE refresh that predates our move can't snap the board backward.
    if (
      optimisticPlyRef.current === null ||
      plyFromFen(confirmedFen) >= optimisticPlyRef.current
    ) {
      optimisticPlyRef.current = null;
      setOptimisticFen(null);
    }
    setStatus(payload.status);
    if (payload.result != null) setResult(payload.result);
    if (payload.drawOfferBy != null) setDrawOfferBy(payload.drawOfferBy);
    else setDrawOfferBy(null);
    if (payload.event === "GAME_END") {
      toaster.create({ title: describeGameEnd(payload.result, payload.reason), type: "info" });
    }
    setMovePending(false);
    submittingMoveRef.current = false;
  }, [applyClocks]);

  // Participants and spectators both watch live; only ended games skip the live feed.
  const { connected, error: subError } = useGameSubscription(
    token && !gameEnded ? id : null,
    token && !gameEnded ? token : null,
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
      // Optimistic: show the move immediately, then confirm against the server echo.
      const predicted = applyUciToFen(optimisticFen ?? fen, move);
      if (predicted) {
        optimisticPlyRef.current = plyFromFen(predicted);
        setOptimisticFen(predicted);
      } else {
        // Couldn't predict locally — fall back to the old "freeze until echo" behaviour.
        setMovePending(true);
      }
      makeMove(token, id, move)
        .then((s) => applyClocks(s))
        .catch((err) => {
          // Roll back the prediction; the confirmed FEN is the source of truth.
          optimisticPlyRef.current = null;
          setOptimisticFen(null);
          setMovePending(false);
          submittingMoveRef.current = false;
          toaster.create({ title: err?.message ?? "Move failed", type: "error" });
        });
    },
    [id, token, gameEnded, fen, optimisticFen, applyClocks]
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

  const handleAbort = () => {
    if (!token) return;
    abortGame(token, id).catch((err) =>
      toaster.create({ title: err?.message ?? "Abort failed", type: "error" })
    );
  };

  const handleSendChat = useCallback(
    (text: string) => {
      if (!token) return;
      sendChatMessage(token, id, text).catch((err) =>
        toaster.create({ title: err?.message ?? "Message failed", type: "error" })
      );
    },
    [token, id]
  );

  const chatLabel = useCallback(
    (userId: string) => {
      if (game?.white?.id === userId) return { name: game.white.username, me: userId === user?.id };
      if (game?.black?.id === userId) return { name: game.black.username, me: userId === user?.id };
      return { name: "Spectator", me: userId === user?.id };
    },
    [game?.white?.id, game?.white?.username, game?.black?.id, game?.black?.username, user?.id]
  );

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
      {!!token && !connected && !gameEnded && (
        <ConnectingBanner subError={subError} onRetry={() => window.location.reload()} />
      )}
      {awayInfo && !gameEnded && (
        <AwayBanner info={awayInfo} onExpire={() => setAwayInfo(null)} />
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
          >
            <HStack justify="space-between" align="center">
              <Box textAlign="left">
                <Text color="textSecondary" fontSize="sm">
                  {orientation === "white" ? game.black?.username : game.white?.username}
                </Text>
                <Text color="textMuted" fontSize="xs">
                  {orientation === "white" ? game.black?.rating : game.white?.rating}
                </Text>
              </Box>
              {clock && (
                <LiveClock
                  ms={topColor === "w" ? clock.whiteMs : clock.blackMs}
                  anchorAt={clock.anchorAt}
                  running={clockRunning(topColor)}
                />
              )}
            </HStack>
          </Box>

          <HStack gap={2} align="stretch">
            {reviewEval && (
              <EvaluationBar evaluation={reviewEval} orientation={orientation} />
            )}
            <Box flex={1} minW={0}>
              <GameBoard
                fen={boardFen}
                orientation={orientation}
                isMyTurn={!!isParticipant && !gameEnded && isMyTurn && !browsing}
                movePending={movePending}
                onMove={handleMove}
                allowMove={!gameEnded && !!isParticipant && !browsing}
                lastMove={browsing ? null : lastSq}
                premoveEnabled={premoveEnabled}
                pendingPremove={pendingPremove}
                onPendingPremove={setPendingPremove}
                extraSquareStyles={browsing ? reviewExtraSquares : undefined}
                reviewArrows={browsing ? reviewArrows : undefined}
                boardTheme={boardTheme}
              />
            </Box>
          </HStack>

          <Box
            py={2}
            px={3}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
            minW="200px"
          >
            <HStack justify="space-between" align="center">
              <Box textAlign="left">
                <Text color="textSecondary" fontSize="sm">
                  {orientation === "white" ? game.white?.username : game.black?.username}
                </Text>
                <Text color="textMuted" fontSize="xs">
                  {orientation === "white" ? game.white?.rating : game.black?.rating}
                </Text>
              </Box>
              {clock && (
                <LiveClock
                  ms={bottomColor === "w" ? clock.whiteMs : clock.blackMs}
                  anchorAt={clock.anchorAt}
                  running={clockRunning(bottomColor)}
                />
              )}
            </HStack>
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
          {/* Compact utility bar: board theme + sound/premove */}
          <Box order={{ base: 4, lg: 1 }} py={2.5} px={3} borderRadius="soft" borderWidth="1px" borderColor="goldDark" bg="bgCard">
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <HStack gap={1.5}>
                {(Object.keys(BOARD_THEMES) as BoardThemeKey[]).map((k) => (
                  <Box
                    key={k}
                    as="button"
                    onClick={() => setBoardTheme(k)}
                    w="22px"
                    h="22px"
                    borderRadius="5px"
                    borderWidth="2px"
                    borderColor={boardTheme === k ? "gold" : "transparent"}
                    title={BOARD_THEMES[k].label}
                    style={{ background: `linear-gradient(135deg, ${BOARD_THEMES[k].lightSq} 50%, ${BOARD_THEMES[k].darkSq} 50%)` }}
                  />
                ))}
              </HStack>
              <HStack gap={1.5}>
                <ToggleChip label="Sound" active={soundsEnabled} onClick={() => setSoundsEnabled((v) => !v)} />
                {isParticipant && !gameEnded && (
                  <ToggleChip label="Premove" active={premoveEnabled} onClick={() => setPremoveEnabled((v) => !v)} />
                )}
              </HStack>
            </HStack>
          </Box>
          <Box order={{ base: 5, lg: 5 }}>
            <MaterialDisplay fen={boardFen} />
          </Box>
          <Box
            order={{ base: 6, lg: 4 }}
            py={2.5}
            px={4}
            borderRadius="soft"
            borderWidth="1px"
            borderColor="goldDark"
            bg="bgCard"
            textAlign="center"
          >
            <Text color="gold" fontWeight="700" fontSize="md">
              {game.timeControl}
              {!game.rated && " · Casual"}
            </Text>
            <Text color="textMuted" fontSize="xs" mt={0.5}>
              {status}
              {result && ` · ${result}`}
            </Text>
          </Box>

          {/* Move timeline — clickable + scrub (live or ended). Sits right under the board on mobile. */}
          {sanMoves.length > 0 && (
            <Box order={{ base: 1, lg: 2 }} py={3} px={4} borderRadius="soft" borderWidth="1px" borderColor="goldDark" bg="bgCard">
              <HStack justify="space-between" mb={2} align="center">
                <Text color="gold" fontSize="xs" fontWeight="600">Moves</Text>
                {browsing && !gameEnded && (
                  <Box as="button" onClick={goLive} px={2} py={0.5} borderRadius="full" bg="rgba(212,175,55,0.18)">
                    <Text fontSize="2xs" fontWeight="800" color="gold" letterSpacing="0.06em">● RETURN TO LIVE</Text>
                  </Box>
                )}
              </HStack>
              <Flex gap={2} flexWrap="wrap" maxH="150px" overflowY="auto" maxW="100%" pb={1} css={{ scrollbarWidth: "thin" }}>
                {sanMoves.map((m, i) => {
                  const isCurrent = browsing ? i === viewPly : i === sanMoves.length - 1;
                  const cls = analysis?.moveReviews?.[i]?.classification;
                  const clsColor = cls ? CLASSIFICATION_META[cls].color : undefined;
                  const mark =
                    cls === "blunder" || cls === "mistake" || cls === "inaccuracy" ? CLASSIFICATION_META[cls].symbol : "";
                  return (
                    <Text
                      key={i}
                      color={isCurrent ? "gold" : clsColor ?? "textSecondary"}
                      fontWeight={isCurrent || mark ? "700" : "normal"}
                      fontSize="sm"
                      whiteSpace="nowrap"
                      flexShrink={0}
                      cursor="pointer"
                      textDecoration={isCurrent ? "underline" : undefined}
                      onClick={() => stepTo(i)}
                    >
                      {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                      {m}
                      {mark}
                    </Text>
                  );
                })}
              </Flex>
              <HStack flexWrap="wrap" gap={1} mt={3} align="center">
                <NavBtn label="⏮" onClick={() => stepTo(0)} disabled={effStep === 0} />
                <NavBtn label="◀" onClick={stepPrev} disabled={effStep === 0} />
                <NavBtn label="▶" onClick={stepNext} disabled={effStep >= sanMoves.length} />
                <NavBtn label="⏭" onClick={() => (gameEnded ? stepTo(sanMoves.length) : goLive())} disabled={!browsing} />
                {canAnalyze && !reviewMode && (
                  <Button size="xs" bg="gold" color="bgDark" borderRadius="soft" ml="auto" onClick={analyzeGame}>
                    Analyze
                  </Button>
                )}
              </HStack>
            </Box>
          )}

          {reviewMode && (
            <Box order={{ base: 2, lg: 3 }} py={3} px={4} borderRadius="soft" borderWidth="1px" borderColor="goldDark" bg="bgCard">
              <HStack justify="space-between" mb={2}>
                <Text color="gold" fontSize="xs" fontWeight="700">
                  Game review
                </Text>
                {review.running && (
                  <Text color="textMuted" fontSize="2xs">
                    Analyzing {review.progress.done}/{review.progress.total}
                  </Text>
                )}
              </HStack>

              {review.running && (
                <Box h="3px" bg="bgSurface" borderRadius="full" mb={3} overflow="hidden">
                  <Box
                    h="full"
                    bg="gold"
                    style={{
                      width: `${review.progress.total ? (review.progress.done / review.progress.total) * 100 : 0}%`,
                      transition: "width 0.2s",
                    }}
                  />
                </Box>
              )}

              {!analysis && !review.running && (
                <Button
                  size="sm"
                  width="full"
                  bg="gold"
                  color="bgDark"
                  borderRadius="soft"
                  mb={3}
                  onClick={() => reviewRunRef.current(sanMoves)}
                >
                  Run engine analysis
                </Button>
              )}

              {analysis && (
                <HStack justify="space-between" mb={3} gap={3} align="stretch">
                  <AccuracyPill name={game.white.username} stats={analysis.white} />
                  <AccuracyPill name={game.black.username} stats={analysis.black} />
                </HStack>
              )}

              {analysis && analysis.evalSeries.length > 1 && (
                <Box mb={3}>
                  <EvalGraph
                    series={analysis.evalSeries}
                    currentPly={browsing ? viewPly : null}
                    onJump={(p) => stepTo(p)}
                  />
                </Box>
              )}

              {effStep >= sanMoves.length ? (
                <Text color="textSecondary" fontSize="sm">Final position — end of game.</Text>
              ) : reviewRow ? (
                <VStack align="stretch" gap={1.5}>
                  {reviewRow.classification && (
                    <HStack gap={2}>
                      <Box
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        style={{ background: `color-mix(in srgb, ${CLASSIFICATION_META[reviewRow.classification].color} 18%, transparent)` }}
                      >
                        <Text fontSize="2xs" fontWeight="800" letterSpacing="0.1em" textTransform="uppercase"
                          style={{ color: CLASSIFICATION_META[reviewRow.classification].color }}>
                          {CLASSIFICATION_META[reviewRow.classification].label}
                        </Text>
                      </Box>
                      {typeof reviewRow.cpLoss === "number" && reviewRow.cpLoss > 0 && (
                        <Text fontSize="2xs" color="textMuted">−{(reviewRow.cpLoss / 100).toFixed(1)}</Text>
                      )}
                    </HStack>
                  )}
                  <Text color="textSecondary" fontSize="sm">
                    <Text as="span" fontWeight="700" color="textPrimary">
                      {(viewPly ?? 0) % 2 === 0 ? "White" : "Black"}
                    </Text>{" "}
                    played{" "}
                    <Text as="span" color="gold" fontWeight="700">{reviewRow.playedSan}</Text>
                  </Text>
                  {reviewRow.playedSan !== reviewRow.bestSan && (
                    <Text color="textSecondary" fontSize="sm">
                      Best was <Text as="span" color="green.400" fontWeight="700">{reviewRow.bestSan}</Text>
                    </Text>
                  )}
                </VStack>
              ) : (
                <Text color="textMuted" fontSize="sm">
                  {review.running ? "Analyzing…" : "Step through the game; run analysis for best moves."}
                </Text>
              )}

              <Button mt={3} size="sm" width="full" variant="outline" borderColor="gold" color="gold" borderRadius="soft" onClick={exitReview}>
                Exit review
              </Button>
            </Box>
          )}

          {user && (
            <Box order={{ base: 3, lg: 6 }}>
              <GameChat messages={chatMessages} label={chatLabel} onSend={handleSendChat} />
            </Box>
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
            {!canAbort && (
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
            )}
            {canAbort ? (
              <Button
                size="sm"
                variant="outline"
                borderColor="statusWarning"
                color="statusWarning"
                borderRadius="soft"
                onClick={handleAbort}
              >
                Abort
              </Button>
            ) : (
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
            )}
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
          👁 Spectating — watching this game live.
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
                <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="blackAlpha.100">
                  <Text color="gold" fontWeight="700" mb={2}>
                    {game.white.username}
                  </Text>
                  {analysis.white.accuracy != null && <StatRow label="Accuracy %" value={analysis.white.accuracy} />}
                  <StatRow label="Inaccuracies" value={analysis.white.inaccuracies} />
                  <StatRow label="Mistakes" value={analysis.white.mistakes} />
                  <StatRow label="Blunders" value={analysis.white.blunders} />
                  <StatRow label="Avg centipawn loss" value={analysis.white.acpl} />
                </Box>
                <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="blackAlpha.100">
                  <Text color="gold" fontWeight="700" mb={2}>
                    {game.black.username}
                  </Text>
                  {analysis.black.accuracy != null && <StatRow label="Accuracy %" value={analysis.black.accuracy} />}
                  <StatRow label="Inaccuracies" value={analysis.black.inaccuracies} />
                  <StatRow label="Mistakes" value={analysis.black.mistakes} />
                  <StatRow label="Blunders" value={analysis.black.blunders} />
                  <StatRow label="Avg centipawn loss" value={analysis.black.acpl} />
                </Box>
              </SimpleGrid>
              <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="blackAlpha.100">
                <Text fontSize="xs" color="textMuted" mb={2}>
                  Evaluation over the game
                </Text>
                <EvalGraph series={analysis.evalSeries} height={150} />
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
        onAnalyze={analyzeGame}
        onRematch={isParticipant ? handleRematch : undefined}
        resultLabel={resultToScore(result)}
        resultDetail={
          result === "DRAW" || result === "STALEMATE"
            ? "Draw"
            : result === "WHITE_WIN"
              ? `${game.white.username} wins`
              : result === "BLACK_WIN"
                ? `${game.black.username} wins`
                : "Game over"
        }
        canAnalyze={canAnalyze}
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

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      px={2.5}
      py={1}
      borderRadius="full"
      borderWidth="1px"
      borderColor={active ? "gold" : "goldDark"}
      bg={active ? "rgba(212,175,55,0.18)" : "transparent"}
    >
      <Text fontSize="2xs" fontWeight="700" letterSpacing="0.08em" color={active ? "gold" : "textMuted"}>
        {label}
      </Text>
    </Box>
  );
}

function NavBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <Button size="xs" variant="outline" borderColor="goldDark" color="textSecondary" borderRadius="soft" onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}

function AccuracyPill({ name, stats }: { name: string; stats: SideStats }) {
  const acc = stats.accuracy;
  const accColor = acc == null ? "textMuted" : acc >= 90 ? "#3fb27f" : acc >= 75 ? "#7f9cf5" : acc >= 60 ? "#e8c14b" : "#e0655c";
  return (
    <VStack flex={1} gap={0.5} align="center" py={2} px={2} borderRadius="soft" bg="bgSurface" borderWidth="1px" borderColor="blackAlpha.200">
      <Text fontSize="2xs" color="textMuted" letterSpacing="0.08em" maxW="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {name}
      </Text>
      <Text fontSize="lg" fontWeight="800" style={{ color: accColor }}>
        {acc == null ? "—" : `${acc}%`}
      </Text>
      <Text fontSize="3xs" color="textMuted">
        {stats.blunders}B · {stats.mistakes}M · {stats.inaccuracies}I
      </Text>
    </VStack>
  );
}

function ConnectingBanner({ subError, onRetry }: { subError: string | null; onRetry: () => void }) {
  // After a few seconds with no connection, explain the likely wait (the live
  // server can cold-start) and offer a retry instead of an endless spinner.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const isError = !!subError;
  return (
    <VStack gap={2} mb={3}>
      <Text color={isError ? "statusWarning" : "textSecondary"} fontSize="sm" textAlign="center">
        {isError
          ? `Couldn't reach the live server — ${subError}.`
          : slow
            ? "Waking the live server — this can take up to a minute…"
            : "Connecting to live server…"}
      </Text>
      {(isError || slow) && (
        <Button
          size="xs"
          variant="outline"
          borderColor="blackAlpha.300"
          color="textPrimary"
          borderRadius="soft"
          _hover={{ borderColor: "gold", color: "gold" }}
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </VStack>
  );
}

function AwayBanner({
  info,
  onExpire,
}: {
  info: { deadline: number; kind: "abandon" | "abort" };
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(() => Math.max(0, info.deadline - Date.now()));
  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, info.deadline - Date.now());
      setRemaining(left);
      if (left <= 0) onExpire();
    };
    tick();
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [info.deadline, onExpire]);

  const secs = Math.ceil(remaining / 1000);
  const mmss = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;
  const isAbandon = info.kind === "abandon";

  return (
    <Box
      mb={3}
      mx="auto"
      maxW="560px"
      px={4}
      py={2.5}
      borderRadius="soft"
      bg="bgCard"
      borderWidth="1px"
      borderColor="statusWarning"
      textAlign="center"
    >
      <Text color="statusWarning" fontSize="sm" fontWeight="600">
        {isAbandon
          ? `Your opponent disconnected — they forfeit in ${mmss} unless they return.`
          : `No move yet — the game aborts in ${mmss} if no one plays.`}
      </Text>
    </Box>
  );
}
