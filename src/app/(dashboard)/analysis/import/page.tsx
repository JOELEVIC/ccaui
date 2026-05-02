"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { fetchLatestMonth, pgnToUci, type ImportedGame } from "@/lib/chesscomImport";
import { useStockfish, type Evaluation } from "@/lib/useStockfish";
import { EvaluationBar } from "@/components/chess/EvaluationBar";

const LS_USERNAME = "cca-chesscom-username";

const DARK_SQUARE = "#9ca3af";
const LIGHT_SQUARE = "#e5e7eb";

function applyMove(fen: string, uci: string): string | null {
  const c = new Chess(fen);
  const move = c.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: (uci[4] as "q" | "r" | "b" | "n") || undefined,
  });
  return move ? c.fen() : null;
}

function fenAtPly(start: string, moves: string[], ply: number): string {
  let fen = start;
  for (let i = 0; i < ply && i < moves.length; i++) {
    const next = applyMove(fen, moves[i]);
    if (!next) break;
    fen = next;
  }
  return fen;
}

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function AnalysisImportPage() {
  const [username, setUsername] = useState("");
  const [games, setGames] = useState<ImportedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ImportedGame | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_USERNAME);
      if (saved) setUsername(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const handleFetch = useCallback(async () => {
    const u = username.trim();
    if (!u) return;
    setLoading(true);
    setError(null);
    setGames([]);
    setSelected(null);
    try {
      const result = await fetchLatestMonth(u, u);
      setGames(result);
      try {
        localStorage.setItem(LS_USERNAME, u);
      } catch {
        /* ignore */
      }
      if (result.length === 0) setError("No games in the latest month");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [username]);

  return (
    <VStack align="stretch" gap={6}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading
            fontFamily="var(--font-playfair), Georgia, serif"
            size="xl"
            color="textPrimary"
          >
            Import from Chess.com
          </Heading>
          <Text color="textSecondary" fontSize="sm" mt={1}>
            Pull your last month of games and review them with the in-browser engine.
          </Text>
        </Box>
        <Link href="/analysis">
          <Button size="sm" variant="ghost" color="gold" borderRadius="soft">
            ← Back to analysis
          </Button>
        </Link>
      </Flex>

      <HStack gap={3} flexWrap="wrap">
        <Input
          placeholder="Chess.com username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleFetch();
          }}
          maxW="320px"
          bg="bgCard"
          borderColor="whiteAlpha.200"
          color="textPrimary"
          _placeholder={{ color: "textMuted" }}
        />
        <Button
          onClick={handleFetch}
          loading={loading}
          bg="gold"
          color="bgDark"
          borderRadius="soft"
          _hover={{ bg: "goldLight" }}
        >
          Fetch latest month
        </Button>
      </HStack>

      {error && (
        <Text color="statusWarning" fontSize="sm">
          {error}
        </Text>
      )}

      {selected ? (
        <ReviewPanel game={selected} onClose={() => setSelected(null)} />
      ) : (
        <GamesGrid games={games} onPick={setSelected} loading={loading} />
      )}
    </VStack>
  );
}

function GamesGrid({
  games,
  onPick,
  loading,
}: {
  games: ImportedGame[];
  onPick: (g: ImportedGame) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <HStack color="textMuted">
        <Spinner size="sm" /> <Text>Fetching games…</Text>
      </HStack>
    );
  }
  if (games.length === 0) {
    return <Text color="textMuted">Enter a Chess.com username and fetch.</Text>;
  }
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
      {games.map((g) => {
        const dot =
          g.perspective?.outcome === "win"
            ? "#4caf50"
            : g.perspective?.outcome === "loss"
              ? "#CE1126"
              : "#a8b0c4";
        return (
          <Box
            key={g.externalUrl}
            p={4}
            bg="bgCard"
            borderRadius="soft"
            borderWidth="1px"
            borderColor="whiteAlpha.080"
            cursor="pointer"
            transition="border-color 0.2s"
            _hover={{ borderColor: "gold" }}
            onClick={() => onPick(g)}
          >
            <HStack justify="space-between" align="flex-start">
              <VStack align="start" gap={1}>
                <Text color="textPrimary" fontWeight="600">
                  {g.white.username} vs {g.black.username}
                </Text>
                <Text color="textMuted" fontSize="xs">
                  {g.timeClass} · {g.timeControl} · {g.result}
                </Text>
              </VStack>
              <HStack gap={2}>
                <Box w="10px" h="10px" borderRadius="full" bg={dot} />
                <Text color="textMuted" fontSize="xs">
                  {g.endedAt.toLocaleDateString()}
                </Text>
              </HStack>
            </HStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

function ReviewPanel({ game, onClose }: { game: ImportedGame; onClose: () => void }) {
  const parsed = useMemo(() => pgnToUci(game.pgn), [game]);
  const [ply, setPly] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const evalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getEvaluation, ready, error: engineError } = useStockfish(2850);

  const startFen = parsed?.initialFen || START_FEN;
  const moves = useMemo(() => parsed?.moves ?? [], [parsed]);
  const fen = useMemo(() => fenAtPly(startFen, moves, ply), [startFen, moves, ply]);
  const orientation: "white" | "black" =
    game.perspective?.color ?? "white";

  useEffect(() => {
    if (!ready) return;
    if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    evalTimerRef.current = setTimeout(() => {
      setEvalLoading(true);
      getEvaluation(fen)
        .then(setEvaluation)
        .finally(() => setEvalLoading(false));
    }, 250);
    return () => {
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    };
  }, [fen, ready, getEvaluation]);

  if (!parsed) {
    return (
      <Box p={6} bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="whiteAlpha.080">
        <Text color="statusWarning">Could not parse this PGN.</Text>
        <Button mt={3} size="sm" variant="ghost" color="gold" onClick={onClose}>
          Back
        </Button>
      </Box>
    );
  }

  const totalPly = moves.length;
  const goTo = (p: number) => setPly(Math.max(0, Math.min(totalPly, p)));

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Box>
          <Text color="gold" fontWeight="600">
            {game.white.username} vs {game.black.username}
          </Text>
          <Text color="textMuted" fontSize="xs">
            {game.timeClass} · {game.timeControl} · {game.result}
          </Text>
        </Box>
        <HStack gap={2}>
          <Link href={game.externalUrl} target="_blank">
            <Button size="sm" variant="outline" borderColor="goldDark" color="gold" borderRadius="soft">
              Open on Chess.com
            </Button>
          </Link>
          <Button size="sm" variant="ghost" color="textMuted" onClick={onClose}>
            ← Back to list
          </Button>
        </HStack>
      </HStack>

      <Flex direction={{ base: "column", lg: "row" }} gap={6} align="flex-start">
        <HStack align="flex-start" gap={2}>
          <EvaluationBar
            evaluation={evaluation}
            loading={evalLoading}
            orientation={orientation}
          />
          <Box w={{ base: "320px", md: "440px" }}>
            <Chessboard
              options={{
                position: fen,
                boardOrientation: orientation,
                allowDragging: false,
                showNotation: true,
                darkSquareStyle: { backgroundColor: DARK_SQUARE },
                lightSquareStyle: { backgroundColor: LIGHT_SQUARE },
                boardStyle: {
                  borderRadius: 12,
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.12)",
                },
              }}
            />
          </Box>
        </HStack>

        <VStack align="stretch" gap={3} flex={1} minW="240px">
          {engineError && (
            <Text color="statusWarning" fontSize="xs">
              Engine: {engineError}
            </Text>
          )}
          {!ready && (
            <HStack color="textMuted" fontSize="sm">
              <Spinner size="xs" /> <Text>Loading engine…</Text>
            </HStack>
          )}

          <Box
            p={3}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
          >
            <HStack gap={2} mb={2}>
              <Button size="xs" variant="outline" borderColor="goldDark" color="gold" onClick={() => goTo(0)}>
                ⏮
              </Button>
              <Button size="xs" variant="outline" borderColor="goldDark" color="gold" onClick={() => goTo(ply - 1)}>
                ◀
              </Button>
              <Button size="xs" variant="outline" borderColor="goldDark" color="gold" onClick={() => goTo(ply + 1)}>
                ▶
              </Button>
              <Button size="xs" variant="outline" borderColor="goldDark" color="gold" onClick={() => goTo(totalPly)}>
                ⏭
              </Button>
              <Text color="textMuted" fontSize="xs">
                {ply}/{totalPly}
              </Text>
            </HStack>
            <Box maxH="280px" overflowY="auto">
              <SimpleGrid columns={2} gap={1}>
                {moves.map((uci, i) => {
                  const sanGame = (() => {
                    const c = new Chess(startFen);
                    for (let k = 0; k < i; k++) {
                      c.move({
                        from: moves[k].slice(0, 2),
                        to: moves[k].slice(2, 4),
                        promotion: (moves[k][4] as "q" | "r" | "b" | "n") || undefined,
                      });
                    }
                    const move = c.move({
                      from: uci.slice(0, 2),
                      to: uci.slice(2, 4),
                      promotion: (uci[4] as "q" | "r" | "b" | "n") || undefined,
                    });
                    return move?.san ?? uci;
                  })();
                  const isCurrent = i + 1 === ply;
                  return (
                    <Box
                      key={i}
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={isCurrent ? "goldDark" : "transparent"}
                      cursor="pointer"
                      onClick={() => goTo(i + 1)}
                    >
                      <Text
                        fontSize="sm"
                        color={isCurrent ? "gold" : "textSecondary"}
                        fontWeight={isCurrent ? "600" : "normal"}
                      >
                        {Math.floor(i / 2) + 1}{i % 2 === 0 ? "." : "..."} {sanGame}
                      </Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          </Box>
        </VStack>
      </Flex>
    </VStack>
  );
}
