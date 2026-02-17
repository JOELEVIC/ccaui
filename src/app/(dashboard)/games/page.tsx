"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, VStack, Button, Input } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toaster } from "@/lib/toaster";
import { CREATE_GAME } from "@/graphql/mutations/games";

const LIVE_GAMES = gql`
  query GamesLiveGames {
    liveGames {
      id
      status
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

const MY_GAMES = gql`
  query MyGames($status: GameStatus) {
    myGames(status: $status) {
      id
      status
      result
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

const USERS = gql`
  query GamesUsers {
    users {
      id
      username
      rating
    }
  }
`;

const TIME_PRESETS = ["5+0", "10+0", "15+10", "30+0", "60+0"];

export default function GamesPage() {
  const router = useRouter();
  const [whiteId, setWhiteId] = useState("");
  const [blackId, setBlackId] = useState("");
  const [timeControl, setTimeControl] = useState("10+0");

  const { data: liveData } = useQuery<{ liveGames: Array<{ id: string; white: { username: string }; black: { username: string }; timeControl: string }> }>(LIVE_GAMES);
  const { data: myData } = useQuery<{ myGames: Array<{ id: string; status: string; result?: string; white: { username: string }; black: { username: string } }> }>(MY_GAMES, { variables: { status: null } });
  const { data: usersData } = useQuery<{ users: Array<{ id: string; username: string; rating: number }> }>(USERS);
  const [createGame, { loading: creating }] = useMutation<{ createGame: { id: string } }>(CREATE_GAME);

  const liveGames = liveData?.liveGames ?? [];
  const myGames = myData?.myGames ?? [];
  const users = usersData?.users ?? [];

  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    if (!whiteId || !blackId || !timeControl) {
      toaster.create({ title: "Select both players and time control", type: "error" });
      return;
    }
    if (whiteId === blackId) {
      toaster.create({ title: "White and Black must be different players", type: "error" });
      return;
    }
    try {
      const { data, errors } = await createGame({
        variables: {
          input: { whiteId, blackId, timeControl },
        },
      });
      if (errors?.length) {
        toaster.create({ title: errors[0]?.message ?? "Failed to create game", type: "error" });
        return;
      }
      if (data?.createGame?.id) {
        toaster.create({ title: "Game created", type: "success" });
        router.push(`/game/${data.createGame.id}`);
      }
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to create game", type: "error" });
    }
  }

  return (
    <VStack align="stretch" gap={8}>
      <Heading
        size="xl"
        color="gold"
        fontFamily="var(--font-playfair), Georgia, serif"
      >
        Play
      </Heading>

      <Box
        as="form"
        onSubmit={handleCreateGame}
        p={6}
        borderRadius="cca"
        bg="bgCard"
        borderWidth="1px"
        borderColor="goldDark"
      >
        <Heading size="md" color="gold" mb={4}>
          Start a Match
        </Heading>
        <VStack align="stretch" gap={3}>
          <Box>
            <Text color="textPrimary" mb={1} fontSize="sm">White</Text>
            <select
              value={whiteId}
              onChange={(e) => setWhiteId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                backgroundColor: "var(--chakra-colors-bgCard)",
                border: "1px solid var(--chakra-colors-goldDark)",
                color: "var(--chakra-colors-textPrimary)",
              }}
            >
              <option value="">Select player</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.rating})
                </option>
              ))}
            </select>
          </Box>
          <Box>
            <Text color="textPrimary" mb={1} fontSize="sm">Black</Text>
            <select
              value={blackId}
              onChange={(e) => setBlackId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                backgroundColor: "var(--chakra-colors-bgCard)",
                border: "1px solid var(--chakra-colors-goldDark)",
                color: "var(--chakra-colors-textPrimary)",
              }}
            >
              <option value="">Select player</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.rating})
                </option>
              ))}
            </select>
          </Box>
          <Box>
            <Text color="textPrimary" mb={1} fontSize="sm">Time control (e.g. 10+0)</Text>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={timeControl === preset ? "solid" : "outline"}
                  bg={timeControl === preset ? "gold" : "transparent"}
                  color={timeControl === preset ? "black" : "gold"}
                  borderColor="gold"
                  onClick={() => setTimeControl(preset)}
                >
                  {preset}
                </Button>
              ))}
              <Input
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
                placeholder="10+0"
                maxW="24"
                size="sm"
                bg="bgCard"
                borderColor="goldDark"
                color="textPrimary"
                borderRadius="cca"
              />
            </Box>
          </Box>
          <Button type="submit" size="sm" bg="gold" color="black" borderRadius="cca" loading={creating} _hover={{ bg: "goldLight" }}>
            Create game
          </Button>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" color="gold" mb={4}>
          Active games
        </Heading>
        {liveGames.length === 0 ? (
          <Text color="textMuted">No active games.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {liveGames.map((g: { id: string; white: { username: string }; black: { username: string }; timeControl: string }) => (
              <Link key={g.id} href={`/game/${g.id}`}>
                <Box
                  p={4}
                  borderRadius="cca"
                  bg="bgCard"
                  borderWidth="1px"
                  borderColor="goldDark"
                  _hover={{ borderColor: "gold", boxShadow: "0 0 16px rgba(198, 167, 94, 0.08)" }}
                  color="gold"
                  transition="all 0.2s"
                >
                  {g.white?.username} vs {g.black?.username} — {g.timeControl}
                </Box>
              </Link>
            ))}
          </VStack>
        )}
      </Box>
      <Box>
        <Heading size="md" color="gold" mb={4}>
          My games
        </Heading>
        {myGames.length === 0 ? (
          <Text color="textMuted">You have no games yet.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {myGames.slice(0, 10).map((g: { id: string; status: string; result?: string; white: { username: string }; black: { username: string } }) => (
              <Link key={g.id} href={`/game/${g.id}`}>
                <Box
                  p={4}
                  borderRadius="cca"
                  bg="bgCard"
                  borderWidth="1px"
                  borderColor="goldDark"
                  color="textPrimary"
                  _hover={{ borderColor: "gold" }}
                >
                  {g.white?.username} vs {g.black?.username} — {g.status}
                  {g.result && ` (${g.result})`}
                </Box>
              </Link>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
