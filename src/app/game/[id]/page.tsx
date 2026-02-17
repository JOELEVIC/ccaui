"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Box, Button, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { Chess } from "chess.js";
import { useAuth } from "@/lib/auth";
import { GameWebSocket, type GameWsMessage } from "@/lib/websocket";
import { GameBoard } from "@/components/chess/GameBoard";

const GAME_QUERY = gql`
  query GamePage($id: ID!) {
    game(id: $id) {
      id
      status
      result
      moves
      timeControl
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

function movesToList(moves: string): string[] {
  if (!moves?.trim()) return [];
  return moves.trim().split(/\s+/).filter(Boolean);
}

export default function GamePage() {
  const params = useParams();
  const id = params.id as string;
  const { user, token } = useAuth();
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [status, setStatus] = useState<string>("PENDING");
  const [result, setResult] = useState<string | null>(null);
  const wsRef = useRef<GameWebSocket | null>(null);

  const { data, loading } = useQuery<{
    game: {
      id: string;
      status: string;
      result?: string | null;
      moves: string;
      timeControl: string;
      white: { id: string; username: string; rating: number };
      black: { id: string; username: string; rating: number };
    };
  }>(GAME_QUERY, {
    variables: { id },
    skip: !id,
  });

  const game = data?.game;
  const isParticipant = user && game && (game.white?.id === user.id || game.black?.id === user.id);
  const isWhite = user && game?.white?.id === user.id;
  const orientation = isWhite ? "white" : "black";
  const turnIsWhite = fen.split(" ")[1] === "w";
  const isMyTurn = isWhite ? turnIsWhite : !turnIsWhite;
  const gameEnded = status === "COMPLETED" || status === "ABANDONED";
  const moveList = game ? movesToList(game.moves ?? "") : [];

  useEffect(() => {
    if (!game) return;
    setFen(movesToFen(game.moves ?? ""));
    setStatus(game.status ?? "PENDING");
    setResult(game.result ?? null);
  }, [game]);

  useEffect(() => {
    if (!id || !user?.id || !token || !isParticipant) return;

    const ws = new GameWebSocket(
      id,
      user.id,
      token,
      (msg: GameWsMessage) => {
        switch (msg.type) {
          case "GAME_STATE":
            setFen(movesToFen(msg.data.moves ?? ""));
            setStatus(msg.data.status);
            setResult(msg.data.result ?? null);
            break;
          case "MOVE":
            setFen(movesToFen(msg.data.moves ?? ""));
            setStatus(msg.data.status);
            break;
          case "GAME_END":
            setStatus(msg.data.status);
            setResult(msg.data.result ?? null);
            toaster.create({ title: "Game ended", type: "info" });
            break;
          case "ERROR":
            toaster.create({ title: msg.message, type: "error" });
            break;
          default:
            break;
        }
      }
    );
    wsRef.current = ws;
    ws.connect();

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [id, user?.id, token, isParticipant]);

  const handleMove = (move: string) => {
    wsRef.current?.sendMove(move);
  };

  const handleResign = () => {
    if (confirm("Resign this game?")) wsRef.current?.resign();
  };

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
          <Button mt={4} color="gold" variant="outline" borderColor="gold" borderRadius="cca">
            Back to games
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bgDark" py={6} px={4}>
      <Flex
        direction={{ base: "column", lg: "row" }}
        align="flex-start"
        justify="center"
        gap={6}
        maxW="1200px"
        mx="auto"
      >
        {/* Left: player (black when orientation white) + board + player (white when orientation white) */}
        <VStack gap={2} align="stretch" flexShrink={0}>
          <Box
            py={2}
            px={3}
            borderRadius="cca"
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
            isMyTurn={isMyTurn && !gameEnded}
            onMove={handleMove}
            allowMove={!gameEnded && !!isParticipant}
          />

          <Box
            py={2}
            px={3}
            borderRadius="cca"
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

        {/* Right: clock + move list */}
        <VStack align="stretch" gap={4} minW="200px">
          <Box
            py={3}
            px={4}
            borderRadius="cca"
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
            borderRadius="cca"
            borderWidth="1px"
            borderColor="goldDark"
            bg="bgCard"
            maxH="300px"
            overflowY="auto"
          >
            <Text color="gold" fontSize="xs" fontWeight="600" mb={2}>
              Moves
            </Text>
            <Flex gap={2} flexWrap="wrap">
              {moveList.map((m, i) => (
                <Text key={i} color="textSecondary" fontSize="sm">
                  {Math.floor(i / 2) + 1}.
                  {i % 2 === 0 ? "" : " .."}
                  {m}
                </Text>
              ))}
              {moveList.length === 0 && (
                <Text color="textMuted" fontSize="sm">—</Text>
              )}
            </Flex>
          </Box>
        </VStack>
      </Flex>

      {/* Bottom: action controls */}
      <HStack justify="center" gap={4} mt={6} flexWrap="wrap">
        {isParticipant && !gameEnded && (
          <>
            <Button
              size="sm"
              variant="outline"
              borderColor="goldDark"
              color="textSecondary"
              borderRadius="cca"
              _hover={{ color: "gold" }}
            >
              Offer draw
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderColor="statusWarning"
              color="statusWarning"
              borderRadius="cca"
              onClick={handleResign}
            >
              Resign
            </Button>
            <Link href="/learning">
              <Button
                size="sm"
                variant="outline"
                borderColor="gold"
                color="gold"
                borderRadius="cca"
              >
                Analyze
              </Button>
            </Link>
          </>
        )}
        <Link href="/games">
          <Button size="sm" variant="ghost" color="textMuted" borderRadius="cca">
            Back to games
          </Button>
        </Link>
      </HStack>

      {!isParticipant && (
        <Text color="textMuted" textAlign="center" mt={4} fontSize="sm">
          You are not a participant in this game.
        </Text>
      )}
    </Box>
  );
}
