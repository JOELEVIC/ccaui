"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import { Chess } from "chess.js";
import { GameBoard } from "@/components/chess/GameBoard";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useStockfish } from "@/lib/useStockfish";
import {
  GlassCard,
  LuxuryButton,
  LuxuryEyebrow,
  LuxuryHeading,
} from "@/components/luxury/LuxuryPrimitives";
import { PLACEMENT_GAMES, SEED_CHOICES, seedElo, nextElo, pickBot } from "@/lib/placement/ladder";
import { analyzePlacementGame } from "@/lib/placement/analyzeGame";
import { preflightEngine, type EnginePreflight } from "@/lib/engineResource";
import {
  startPlacementRun,
  savePlacementProgress,
  submitPlacementRun,
  type PlacementGamePayload,
  type PlacementEstimate,
} from "@/lib/usePlacement";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const LS_KEY = "dchess-placement-v1";

type Phase = "intro" | "playing" | "analyzing" | "submitting" | "done" | "error";

function safeChess(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}
function getRandomMove(fen: string): string | null {
  const c = safeChess(fen);
  if (!c) return null;
  const moves = c.moves({ verbose: true });
  if (moves.length === 0) return null;
  const m = moves[Math.floor(Math.random() * moves.length)];
  return `${m.from}${m.to}${m.promotion ?? ""}`;
}
function applyMove(fen: string, uci: string): string | null {
  const c = safeChess(fen);
  if (!c) return null;
  try {
    const mv = c.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: (uci[4] as "q" | "r" | "b" | "n") || undefined,
    });
    return mv ? c.fen() : null;
  } catch {
    return null;
  }
}

interface Persisted {
  runId: string;
  gameIndex: number;
  currentElo: number;
  seedKey?: string;
  games: PlacementGamePayload[];
}
function loadPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}
function persist(p: Persisted) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
function clearPersisted() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

export default function PlacementPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("intro");
  const [runId, setRunId] = useState<string | null>(null);
  const [seedKey, setSeedKey] = useState<string | undefined>(undefined);
  const [gameIndex, setGameIndex] = useState(0);
  const [currentElo, setCurrentElo] = useState(seedElo());
  const [fen, setFen] = useState(START_FEN);
  const [history, setHistory] = useState<string[]>([]);
  const [botThinking, setBotThinking] = useState(false);
  const [gameScore, setGameScore] = useState<number | null>(null); // user score for the just-finished game
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [estimate, setEstimate] = useState<PlacementEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Engine pre-flight: check the wasm resource + backend, warm the backend, and
  // set up durable caching BEFORE the user can start.
  const [preflight, setPreflight] = useState<EnginePreflight | null>(null);

  const gamesRef = useRef<PlacementGamePayload[]>([]);
  const epochRef = useRef(0);
  const botRunningRef = useRef(false);

  const userColor: "w" | "b" = gameIndex % 2 === 0 ? "w" : "b";
  const orientation = userColor === "w" ? "white" : "black";
  const persona = useMemo(() => pickBot(currentElo), [currentElo]);

  const { getBestMove, analyse, warming } = useStockfish(persona.elo);

  const turnIsWhite = fen.split(" ")[1] === "w";
  const isUserTurn = userColor === "w" ? turnIsWhite : !turnIsWhite;

  // ── engine pre-flight (resource + backend availability, warm, durable cache) ──
  useEffect(() => {
    let alive = true;
    void preflightEngine().then((p) => {
      if (alive) setPreflight(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  // ── start / resume ──────────────────────────────────────────────────────
  const beginRun = useCallback(async (chosenSeed?: string) => {
    setError(null);
    try {
      const id = await startPlacementRun();
      const saved = loadPersisted();
      if (saved && saved.runId === id && saved.gameIndex < PLACEMENT_GAMES) {
        // Resume an interrupted run.
        gamesRef.current = saved.games;
        setRunId(id);
        setSeedKey(saved.seedKey);
        setGameIndex(saved.gameIndex);
        setCurrentElo(saved.currentElo);
        setFen(START_FEN);
        setHistory([]);
        setGameScore(null);
        epochRef.current++;
        setPhase("playing");
        return;
      }
      // Fresh run.
      gamesRef.current = [];
      setRunId(id);
      setSeedKey(chosenSeed);
      setGameIndex(0);
      setCurrentElo(seedElo(chosenSeed));
      setFen(START_FEN);
      setHistory([]);
      setGameScore(null);
      epochRef.current++;
      setPhase("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start placement");
      setPhase("error");
    }
  }, []);

  // ── bot move ────────────────────────────────────────────────────────────
  const runBot = useCallback(async () => {
    if (botRunningRef.current) return;
    botRunningRef.current = true;
    const epoch = epochRef.current;
    try {
      const startedAt = Date.now();
      let moveStr: string | null;
      if (Math.random() < persona.mistakeChance) {
        moveStr = getRandomMove(fen) ?? (await getBestMove(fen));
      } else {
        moveStr = (await getBestMove(fen)) ?? getRandomMove(fen);
      }
      if (!moveStr) {
        setBotThinking(false);
        return;
      }
      const elapsed = Date.now() - startedAt;
      const target = 350 + Math.random() * 500;
      if (elapsed < target) await new Promise((r) => setTimeout(r, target - elapsed));
      if (epoch !== epochRef.current) {
        setBotThinking(false);
        return;
      }
      const newFen = applyMove(fen, moveStr);
      if (newFen) {
        setFen(newFen);
        setHistory((prev) => [...prev, moveStr!]);
        const c = new Chess(newFen);
        if (c.isGameOver()) {
          // Bot just moved: user loses on mate, otherwise draw.
          setGameScore(c.isCheckmate() ? 0 : 0.5);
        }
      }
      setBotThinking(false);
    } finally {
      botRunningRef.current = false;
    }
  }, [fen, getBestMove, persona]);

  useEffect(() => {
    if (phase === "playing" && botThinking) void runBot();
  }, [phase, botThinking, runBot]);

  // Bot opens when the user is Black and the board is fresh.
  useEffect(() => {
    if (phase !== "playing" || history.length > 0 || gameScore !== null || botThinking) return;
    if (userColor === "b") setBotThinking(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, gameIndex]);

  // ── user move ───────────────────────────────────────────────────────────
  const handleMove = useCallback(
    (uci: string) => {
      if (phase !== "playing" || gameScore !== null) return;
      const newFen = applyMove(fen, uci);
      if (!newFen) return;
      setFen(newFen);
      setHistory((prev) => [...prev, uci]);
      const c = new Chess(newFen);
      if (c.isGameOver()) {
        // User just moved: user wins on mate, otherwise draw.
        setGameScore(c.isCheckmate() ? 1 : 0.5);
      } else {
        setBotThinking(true);
      }
    },
    [fen, phase, gameScore]
  );

  const resign = useCallback(() => {
    if (phase !== "playing" || gameScore !== null) return;
    epochRef.current++;
    setBotThinking(false);
    setGameScore(0);
  }, [phase, gameScore]);

  // ── analyse the finished game, then advance or submit ─────────────────────
  useEffect(() => {
    if (phase !== "playing" || gameScore === null || !runId) return;
    const score = gameScore;
    const movesForGame = history;
    const playedColor = userColor;
    const playedPersona = persona;
    const idx = gameIndex;
    const elo = currentElo;
    let cancelled = false;

    (async () => {
      setPhase("analyzing");
      setProgress({ done: 0, total: movesForGame.length + 1 });
      const userMoves = await analyzePlacementGame({
        startFen: START_FEN,
        moves: movesForGame,
        userColor: playedColor,
        analyse,
        onProgress: (done, total) => !cancelled && setProgress({ done, total }),
      });
      if (cancelled) return;

      const payload: PlacementGamePayload = {
        botId: playedPersona.id,
        botElo: playedPersona.elo,
        color: playedColor,
        score,
        moves: movesForGame.join(" "),
        userMoves,
      };
      const nextGames = [...gamesRef.current, payload];
      gamesRef.current = nextGames;

      const ne = nextElo(elo, score, idx);
      persist({ runId, gameIndex: idx + 1, currentElo: ne, seedKey, games: nextGames });
      void savePlacementProgress(runId, nextGames).catch(() => {});

      if (idx + 1 >= PLACEMENT_GAMES) {
        setPhase("submitting");
        try {
          const res = await submitPlacementRun(runId, nextGames);
          if (cancelled) return;
          setEstimate(res.estimate);
          clearPersisted();
          setPhase("done");
        } catch (e) {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : "Submission failed");
          setPhase("error");
        }
        return;
      }

      // Advance to the next calibration game.
      epochRef.current++;
      setCurrentElo(ne);
      setGameIndex(idx + 1);
      setFen(START_FEN);
      setHistory([]);
      setGameScore(null);
      setBotThinking(false);
      setPhase("playing");
    })();

    return () => {
      cancelled = true;
    };
    // Trigger on the finished-game score only. MUST NOT depend on `phase`: this
    // effect calls setPhase("analyzing"), and if `phase` were a dependency that
    // state change would fire the cleanup (cancelled = true) and re-run the
    // effect, freezing progress at 0% and never advancing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameScore, runId]);

  // ── render ────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    const checking = preflight === null;
    const engineReady = preflight?.ok ?? false;
    const wasmReady = preflight?.wasm === "ready";
    return (
      <Shell>
        <VStack gap={5} maxW="480px" mx="auto" textAlign="center" py={{ base: 8, md: 16 }}>
          <LuxuryEyebrow>Rating placement</LuxuryEyebrow>
          <LuxuryHeading size="lg">Let&apos;s find your rating</LuxuryHeading>
          <Text color="var(--lux-text-secondary)" fontSize="md" lineHeight="1.6">
            Play {PLACEMENT_GAMES} quick games against our calibration bots. We analyse how you
            play — not just whether you win — to estimate your Elo, then set it as your rating.
          </Text>
          <Box w="full">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="var(--lux-text-muted)" mb={3}>
              Roughly how strong are you? (optional)
            </Text>
            <Flex gap={2} flexWrap="wrap" justify="center">
              {SEED_CHOICES.map((c) => (
                <LuxuryButton
                  key={c.key}
                  variant={seedKey === c.key ? "gold" : "outline"}
                  size="sm"
                  onClick={() => setSeedKey(c.key)}
                >
                  {c.label}
                </LuxuryButton>
              ))}
            </Flex>
          </Box>
          <LuxuryButton
            variant="gold"
            size="lg"
            disabled={checking || !engineReady}
            onClick={() => beginRun(seedKey)}
          >
            {checking ? "Preparing engine…" : "Start placement"}
          </LuxuryButton>
          {checking ? (
            <Text fontSize="xs" color="var(--lux-text-muted)" letterSpacing="0.12em">
              ◇ Checking analysis engine…
            </Text>
          ) : !engineReady ? (
            <Text fontSize="sm" color="#e0655c">
              The analysis engine isn&apos;t available right now. Check your connection and try again.
            </Text>
          ) : !wasmReady ? (
            <Text fontSize="xs" color="#e8c14b">
              Running in server mode — analysis may be a little slower than usual.
            </Text>
          ) : null}
          {error ? <Text color="#e0655c" fontSize="sm">{error}</Text> : null}
        </VStack>
      </Shell>
    );
  }

  if (phase === "analyzing" || phase === "submitting") {
    const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <Shell>
        <VStack gap={5} maxW="460px" mx="auto" textAlign="center" py={{ base: 10, md: 20 }}>
          <LuxuryEyebrow>
            {phase === "submitting" ? "Calculating your rating" : `Analysing game ${gameIndex + 1}`}
          </LuxuryEyebrow>
          <LuxuryHeading size="md">Reading your moves…</LuxuryHeading>
          <Box w="full" h="8px" borderRadius="999px" bg="var(--lux-glass-surface)" overflow="hidden">
            <Box
              h="full"
              borderRadius="999px"
              bg="var(--lux-gold)"
              style={{ width: `${phase === "submitting" ? 100 : pct}%`, transition: "width 0.3s ease" }}
            />
          </Box>
          <Text color="var(--lux-text-muted)" fontSize="sm">
            {phase === "submitting" ? "Fusing results and move quality…" : `${pct}%`}
          </Text>
        </VStack>
      </Shell>
    );
  }

  if (phase === "done" && estimate) {
    return (
      <Shell>
        <VStack gap={5} maxW="520px" mx="auto" textAlign="center" py={{ base: 8, md: 14 }}>
          <LuxuryEyebrow>Placement complete</LuxuryEyebrow>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "6xl", md: "7xl" }}
            color="var(--lux-gold)"
            fontWeight="600"
            lineHeight="1"
            style={{ textShadow: "0 0 24px rgba(212,175,55,0.35)", fontStyle: "italic" }}
          >
            {estimate.rating}
          </Text>
          <Text color="var(--lux-text-secondary)">
            Your new rating (±{estimate.rd}). This replaces your starting rating.
          </Text>
          <GlassCard>
            <Box px={5} py={4}>
              <VStack align="stretch" gap={2} fontSize="sm">
                <Row label="From results" value={`${estimate.resultRating}`} />
                <Row label="From move quality" value={`${estimate.moveRating}`} />
                <Row label="Avg. accuracy" value={`${estimate.meanAccuracy}%`} />
                <Row label="Avg. centipawn loss" value={`${estimate.weightedAcpl}`} />
                <Row label="Moves analysed" value={`${estimate.totalUserMoves}`} />
              </VStack>
            </Box>
          </GlassCard>
          <HStack gap={3}>
            <LuxuryButton variant="gold" size="md" onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </LuxuryButton>
            <LuxuryButton variant="outline" size="md" onClick={() => router.push("/games")}>
              Play a game
            </LuxuryButton>
          </HStack>
        </VStack>
      </Shell>
    );
  }

  if (phase === "error") {
    return (
      <Shell>
        <VStack gap={4} maxW="440px" mx="auto" textAlign="center" py={{ base: 10, md: 20 }}>
          <LuxuryEyebrow>Something went wrong</LuxuryEyebrow>
          <Text color="var(--lux-text-secondary)">{error ?? "Please try again."}</Text>
          <LuxuryButton variant="gold" size="md" onClick={() => beginRun(seedKey)}>
            Retry
          </LuxuryButton>
        </VStack>
      </Shell>
    );
  }

  // playing
  return (
    <Shell>
      <VStack gap={4} maxW="560px" mx="auto">
        <HStack justify="space-between" w="full" align="center">
          <LuxuryEyebrow>
            Game {gameIndex + 1} of {PLACEMENT_GAMES}
          </LuxuryEyebrow>
          <Text fontSize="xs" color="var(--lux-text-muted)" letterSpacing="0.1em">
            {persona.avatar} {persona.name} · {persona.elo}
          </Text>
        </HStack>

        <HStack gap={1.5} w="full">
          {Array.from({ length: PLACEMENT_GAMES }).map((_, i) => (
            <Box
              key={i}
              flex="1"
              h="4px"
              borderRadius="999px"
              bg={i < gameIndex ? "var(--lux-gold)" : i === gameIndex ? "rgba(212,175,55,0.4)" : "var(--lux-glass-border)"}
            />
          ))}
        </HStack>

        <GameBoard
          fen={fen}
          orientation={orientation}
          isMyTurn={isUserTurn && !botThinking && gameScore === null}
          movePending={false}
          onMove={handleMove}
          allowMove={isUserTurn && !botThinking && gameScore === null}
        />

        <HStack justify="space-between" w="full">
          <Text fontSize="xs" color="var(--lux-text-muted)">
            You play {userColor === "w" ? "White" : "Black"}
            {warming ? " · warming engine…" : botThinking ? " · opponent thinking…" : ""}
          </Text>
          <LuxuryButton variant="ghost" size="sm" onClick={resign}>
            Resign game
          </LuxuryButton>
        </HStack>
      </VStack>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Box minH="100vh" bg="var(--lux-obsidian)" color="var(--lux-text-primary)" px={{ base: 4, md: 8 }} py={6}>
        <Box maxW="1100px" mx="auto">{children}</Box>
      </Box>
    </ProtectedRoute>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <HStack justify="space-between">
      <Text color="var(--lux-text-muted)">{label}</Text>
      <Text color="var(--lux-text-primary)" fontWeight="600">
        {value}
      </Text>
    </HStack>
  );
}
