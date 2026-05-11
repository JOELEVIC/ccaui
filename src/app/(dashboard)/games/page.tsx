"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, HStack, Input, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toaster } from "@/lib/toaster";
import { CREATE_GAME } from "@/graphql/mutations/games";
import {
  ChessWatermark,
  GlassCard,
  LuxuryButton,
  LuxuryEyebrow,
  LuxuryHeading,
} from "@/components/luxury/LuxuryPrimitives";

const BOT_ELO_PRESETS = [230, 400, 600, 800, 1000, 1200, 1600, 2000, 2400, 2800, 3200];

const LIVE_GAMES = gql`
  query GamesLiveGames {
    liveGames {
      id
      status
      timeControl
      white { id username rating }
      black { id username rating }
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
      white { id username rating }
      black { id username rating }
    }
  }
`;

const USERS = gql`
  query GamesUsers {
    users { id username rating }
  }
`;

const TIME_PRESETS = ["5+0", "10+0", "15+10", "30+0", "60+0"];

type PlayMode = "human" | "self" | "bot";

export default function GamesPage() {
  const router = useRouter();
  const [playMode, setPlayMode] = useState<PlayMode>("human");
  const [selectedBotElo, setSelectedBotElo] = useState(1600);
  const [whiteId, setWhiteId] = useState("");
  const [blackId, setBlackId] = useState("");
  const [timeControl, setTimeControl] = useState("10+0");

  const { data: liveData } = useQuery<{
    liveGames: Array<{ id: string; white: { username: string }; black: { username: string }; timeControl: string }>;
  }>(LIVE_GAMES);
  const { data: myData } = useQuery<{
    myGames: Array<{ id: string; status: string; result?: string; white: { username: string }; black: { username: string } }>;
  }>(MY_GAMES, { variables: { status: null } });
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
      const { data, error } = await createGame({
        variables: { input: { whiteId, blackId, timeControl } },
      });
      if (error) {
        toaster.create({ title: error.message || "Failed to create game", type: "error" });
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
    <Box position="relative" maxW="1180px" mx="auto">
      <ChessWatermark piece="queen" size={420} opacity={0.035} position={{ top: "-40px", right: "-60px" }} />

      {/* Header */}
      <Box mb={{ base: 5, md: 7 }} position="relative" zIndex={1}>
        <HStack align="center" gap={4}>
          <LuxuryHeading size="2xl">
            <Text as="span" color="var(--lux-gold)" style={{ fontStyle: "italic" }}>Play</Text>
          </LuxuryHeading>
          <Box flex={1} className="lux-divider" />
        </HStack>
      </Box>

      {/* Mode tabs */}
      <HStack mb={{ base: 5, md: 7 }} gap={2} flexWrap="wrap" position="relative" zIndex={1}>
        {(
          [
            { id: "human", label: "Human" },
            { id: "bot", label: "Engine" },
            { id: "self", label: "Self" },
          ] as { id: PlayMode; label: string }[]
        ).map((m) => (
          <ModeTab
            key={m.id}
            label={m.label}
            active={playMode === m.id}
            onClick={() => setPlayMode(m.id)}
          />
        ))}
      </HStack>

      {playMode === "self" && (
        <GlassCard hero>
          <Box px={{ base: 5, md: 7 }} py={{ base: 5, md: 6 }}>
            <LuxuryHeading size="md">Two players, one device.</LuxuryHeading>
            <Box mt={4}>
              <LuxuryButton variant="gold" size="md" glyph="▸" href="/play/local">
                Start
              </LuxuryButton>
            </Box>
          </Box>
        </GlassCard>
      )}

      {playMode === "bot" && (
        <GlassCard hero>
          <Box px={{ base: 5, md: 7 }} py={{ base: 5, md: 6 }}>
            <LuxuryHeading size="md">Select engine strength.</LuxuryHeading>
            <SimpleGrid mt={4} columns={{ base: 3, sm: 4, md: 6 }} gap={2}>
              {BOT_ELO_PRESETS.map((elo) => {
                const active = selectedBotElo === elo;
                return (
                  <Box
                    key={elo}
                    as="button"
                    onClick={() => setSelectedBotElo(elo)}
                    py={2.5}
                    borderRadius="6px"
                    bg={active ? "rgba(212,175,55,0.18)" : "var(--lux-glass-surface)"}
                    borderWidth="1px"
                    borderColor={active ? "var(--lux-gold)" : "var(--lux-glass-border)"}
                    transition="all 0.18s"
                    _hover={{ borderColor: "var(--lux-gold-muted)" }}
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    <Text
                      fontFamily="var(--font-inter), sans-serif"
                      fontSize="xs"
                      fontWeight="700"
                      letterSpacing="0.18em"
                      color={active ? "var(--lux-gold-bright)" : "var(--lux-text-secondary)"}
                      style={active ? { textShadow: "0 0 6px rgba(212,175,55,0.45)" } : undefined}
                    >
                      {elo}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
            <Box mt={5}>
              <LuxuryButton
                variant="gold"
                size="md"
                glyph="▸"
                href={`/play/bot?elo=${selectedBotElo}`}
              >
                Begin · {selectedBotElo} Elo
              </LuxuryButton>
            </Box>
          </Box>
        </GlassCard>
      )}

      {playMode === "human" && (
        <VStack align="stretch" gap={{ base: 6, md: 8 }}>
          {/* Start a match form */}
          <GlassCard hero>
            <Box as="form" onSubmit={handleCreateGame} px={{ base: 5, md: 7 }} py={{ base: 5, md: 6 }}>
              <LuxuryHeading size="md">New match</LuxuryHeading>

              <SimpleGrid mt={5} columns={{ base: 1, md: 2 }} gap={4}>
                <PlayerField
                  label="White"
                  value={whiteId}
                  onChange={setWhiteId}
                  users={users}
                />
                <PlayerField
                  label="Black"
                  value={blackId}
                  onChange={setBlackId}
                  users={users}
                />
              </SimpleGrid>

              <Box mt={5}>
                <LuxuryEyebrow>Time Control</LuxuryEyebrow>
                <Flex mt={2} gap={2} flexWrap="wrap" alignItems="center">
                  {TIME_PRESETS.map((preset) => {
                    const active = timeControl === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTimeControl(preset)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "999px",
                          background: active ? "rgba(212,175,55,0.18)" : "var(--lux-glass-surface)",
                          border: `1px solid ${active ? "var(--lux-gold)" : "var(--lux-glass-border)"}`,
                          transition: "all 0.18s",
                          cursor: "pointer",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          color: active ? "var(--lux-gold-bright)" : "var(--lux-text-secondary)",
                        }}
                      >
                        {preset}
                      </button>
                    );
                  })}
                  <Input
                    value={timeControl}
                    onChange={(e) => setTimeControl(e.target.value)}
                    placeholder="10+0"
                    maxW="24"
                    size="sm"
                    bg="var(--lux-glass-surface)"
                    borderColor="var(--lux-glass-border)"
                    color="var(--lux-text-primary)"
                    borderRadius="6px"
                    _placeholder={{ color: "var(--lux-text-muted)" }}
                  />
                </Flex>
              </Box>

              <Box mt={6}>
                <LuxuryButton variant="gold" size="md" glyph="▸" type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create match"}
                </LuxuryButton>
              </Box>
            </Box>
          </GlassCard>

          {/* Active games */}
          <Box>
            <HStack mb={4} align="center" gap={3}>
              <LuxuryHeading size="sm">Active</LuxuryHeading>
              <Box flex={1} className="lux-divider" />
              <Text fontSize="2xs" color="var(--lux-text-muted)" letterSpacing="0.18em" textTransform="uppercase">
                {liveGames.length} live
              </Text>
            </HStack>
            {liveGames.length === 0 ? (
              <EmptyState text="No active matches." />
            ) : (
              <VStack align="stretch" gap={2.5}>
                {liveGames.map((g) => (
                  <GameRow
                    key={g.id}
                    href={`/game/${g.id}`}
                    title={`${g.white?.username ?? "—"} vs ${g.black?.username ?? "—"}`}
                    meta={g.timeControl}
                    accent="live"
                  />
                ))}
              </VStack>
            )}
          </Box>

          {/* My games */}
          <Box>
            <HStack mb={4} align="center" gap={3}>
              <LuxuryHeading size="sm">Your games</LuxuryHeading>
              <Box flex={1} className="lux-divider" />
              <Text fontSize="2xs" color="var(--lux-text-muted)" letterSpacing="0.18em" textTransform="uppercase">
                {myGames.length} games
              </Text>
            </HStack>
            {myGames.length === 0 ? (
              <EmptyState text="No games yet." />
            ) : (
              <VStack align="stretch" gap={2.5}>
                {myGames.slice(0, 10).map((g) => (
                  <GameRow
                    key={g.id}
                    href={`/game/${g.id}`}
                    title={`${g.white?.username ?? "—"} vs ${g.black?.username ?? "—"}`}
                    meta={g.result ? `${g.status} · ${g.result}` : g.status}
                    accent={g.status === "COMPLETED" ? "done" : "live"}
                  />
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      )}
    </Box>
  );
}

/* ─────────── ModeTab ─────────── */

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      px={4}
      py={2.5}
      borderRadius="999px"
      bg={active ? "rgba(212,175,55,0.14)" : "var(--lux-glass-surface)"}
      borderWidth="1px"
      borderColor={active ? "var(--lux-gold)" : "var(--lux-glass-border)"}
      transition="all 0.18s"
      _hover={{ borderColor: "var(--lux-gold-muted)" }}
      style={{ backdropFilter: "blur(12px)" }}
    >
      <Text
        fontFamily="var(--font-inter), sans-serif"
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.2em"
        textTransform="uppercase"
        color={active ? "var(--lux-gold-bright)" : "var(--lux-text-secondary)"}
        style={active ? { textShadow: "0 0 6px rgba(212,175,55,0.5)" } : undefined}
      >
        {label}
      </Text>
    </Box>
  );
}

/* ─────────── PlayerField ─────────── */

function PlayerField({
  label,
  value,
  onChange,
  users,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  users: Array<{ id: string; username: string; rating: number }>;
}) {
  return (
    <Box>
      <Text
        fontSize="2xs"
        color="var(--lux-text-muted)"
        letterSpacing="0.22em"
        textTransform="uppercase"
        fontFamily="var(--font-inter), sans-serif"
        mb={1.5}
      >
        {label}
      </Text>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 6,
          background: "var(--lux-glass-surface)",
          border: "1px solid var(--lux-glass-border)",
          color: "var(--lux-text-primary)",
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 14,
          backdropFilter: "blur(10px)",
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
  );
}

/* ─────────── GameRow ─────────── */

function GameRow({
  href,
  title,
  meta,
  accent,
}: {
  href: string;
  title: string;
  meta: string;
  accent: "live" | "done";
}) {
  const dotColor = accent === "live" ? "var(--lux-gold)" : "var(--lux-text-muted)";
  return (
    <GlassCard href={href}>
      <HStack px={5} py={3.5} justify="space-between" align="center" gap={4} flexWrap="wrap">
        <HStack gap={3} align="center">
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={dotColor}
            style={accent === "live" ? { boxShadow: "0 0 6px var(--lux-gold)" } : undefined}
          />
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize="md"
            color="var(--lux-text-primary)"
            fontWeight="600"
            letterSpacing="0.03em"
          >
            {title}
          </Text>
        </HStack>
        <HStack gap={3} align="center">
          <Text
            fontFamily="var(--font-inter), sans-serif"
            fontSize="2xs"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--lux-text-muted)"
          >
            {meta}
          </Text>
          <Text color="var(--lux-gold-muted)" fontSize="md">→</Text>
        </HStack>
      </HStack>
    </GlassCard>
  );
}

/* ─────────── EmptyState ─────────── */

function EmptyState({ text }: { text: string }) {
  return (
    <Box
      py={6}
      px={5}
      borderRadius="8px"
      bg="var(--lux-glass-surface)"
      borderWidth="1px"
      borderColor="var(--lux-glass-border)"
      borderStyle="dashed"
      textAlign="center"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <Text fontSize="sm" className="lux-text-muted" letterSpacing="0.06em" fontStyle="italic">
        {text}
      </Text>
    </Box>
  );
}
