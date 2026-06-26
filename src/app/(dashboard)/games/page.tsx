"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, HStack, Input, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toaster } from "@/lib/toaster";
import { useAuth } from "@/lib/auth";
import {
  MY_CHALLENGES,
  CREATE_CHALLENGE,
  ACCEPT_CHALLENGE,
  DECLINE_CHALLENGE,
  CANCEL_CHALLENGE,
} from "@/graphql/challenges";
import {
  ChessWatermark,
  GlassCard,
  LuxuryButton,
  LuxuryEyebrow,
  LuxuryHeading,
} from "@/components/luxury/LuxuryPrimitives";
import { BOT_PERSONAS, BOT_LEVELS } from "@/lib/botPersonas";
import { useOngoingGame } from "@/lib/useOngoingGame";

const LIVE_GAMES = gql`
  query GamesLiveGames {
    liveGames {
      id
      status
      timeControl
      rated
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
      rated
      whiteRating
      blackRating
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
type InviteMode = "direct" | "open";

interface Player {
  id: string;
  username: string;
  rating: number;
}
interface GameLite {
  id: string;
  status: string;
  result?: string | null;
  timeControl: string;
  rated: boolean;
  whiteRating?: number | null;
  blackRating?: number | null;
  white: Player;
  black: Player;
}
interface ChallengeLite {
  id: string;
  creatorColor: string;
  timeControl: string;
  rated: boolean;
  status: string;
  creator: Player;
  opponent?: Player | null;
}

export default function GamesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const meId = user?.id;
  const [playMode, setPlayMode] = useState<PlayMode>("human");
  const [inviteMode, setInviteMode] = useState<InviteMode>("direct");
  const [opponentId, setOpponentId] = useState("");
  const [colorChoice, setColorChoice] = useState<"white" | "black" | "random">("random");
  const [timeControl, setTimeControl] = useState("10+0");
  const [rated, setRated] = useState(true);
  const [openLink, setOpenLink] = useState<string | null>(null);

  const { data: liveData } = useQuery<{ liveGames: GameLite[] }>(LIVE_GAMES);
  const { data: myData } = useQuery<{ myGames: GameLite[] }>(MY_GAMES, { variables: { status: null } });
  const { data: usersData } = useQuery<{ users: Player[] }>(USERS);
  const { data: chData, refetch: refetchChallenges } = useQuery<{ myChallenges: ChallengeLite[] }>(
    MY_CHALLENGES,
    { pollInterval: 20000 }
  );

  const [createChallenge, { loading: creating }] = useMutation<{ createChallenge: { id: string; opponent?: { id: string } | null } }>(CREATE_CHALLENGE);
  const [acceptChallenge] = useMutation<{ acceptChallenge: { id: string } }>(ACCEPT_CHALLENGE);
  const [declineChallenge] = useMutation(DECLINE_CHALLENGE);
  const [cancelChallenge] = useMutation(CANCEL_CHALLENGE);

  const { ongoingId, atLimit } = useOngoingGame();
  const liveGames = liveData?.liveGames ?? [];
  // Hide aborted/voided games — they're noise.
  const myGames = (myData?.myGames ?? []).filter((g) => g.status !== "ABANDONED");
  const users = usersData?.users ?? [];
  const challenges = chData?.myChallenges ?? [];
  const incoming = challenges.filter((c) => c.creator.id !== meId);
  const outgoing = challenges.filter((c) => c.creator.id === meId);

  function inviteUrl(id: string) {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/challenge/${id}`;
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toaster.create({ title: "Invite link copied", type: "success" });
    } catch {
      toaster.create({ title: text, type: "info" });
    }
  }

  async function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!meId) {
      toaster.create({ title: "Sign in to play", type: "error" });
      return;
    }
    if (atLimit && ongoingId) {
      toaster.create({ title: "Finish your current game first", type: "error" });
      router.push(`/game/${ongoingId}`);
      return;
    }
    if (!timeControl) {
      toaster.create({ title: "Pick a time control", type: "error" });
      return;
    }
    // Direct challenge with no opponent chosen → match against a random player.
    let oppId: string | null = null;
    let randomMatched = false;
    if (inviteMode === "direct") {
      if (opponentId) {
        oppId = opponentId;
      } else {
        const pool = users.filter((u) => u.id !== meId);
        if (pool.length === 0) {
          toaster.create({ title: "No other players to match with yet", type: "error" });
          return;
        }
        oppId = pool[Math.floor(Math.random() * pool.length)].id;
        randomMatched = true;
      }
    }
    setOpenLink(null);
    try {
      const { data, error } = await createChallenge({
        variables: {
          input: {
            opponentId: oppId,
            creatorColor: colorChoice,
            timeControl,
            rated,
          },
        },
      });
      if (error) {
        toaster.create({ title: error.message || "Couldn't create the challenge", type: "error" });
        return;
      }
      const challenge = data?.createChallenge as
        | { id: string; game?: { id: string } | null }
        | undefined;
      if (!challenge?.id) return;

      // Direct challenge: a game was created up-front — drop the challenger
      // straight into it to wait. The opponent gets a global prompt and joins
      // the same game when they accept.
      if (inviteMode === "direct" && challenge.game?.id) {
        const name = users.find((u) => u.id === oppId)?.username ?? "your opponent";
        toaster.create({
          title: randomMatched ? `Matched with ${name} — waiting for them` : `Waiting for ${name} to accept`,
          type: "success",
        });
        router.push(`/game/${challenge.game.id}`);
        return;
      }

      await refetchChallenges();
      if (inviteMode === "open") {
        const url = inviteUrl(challenge.id);
        setOpenLink(url);
        copy(url);
      }
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Couldn't create the challenge", type: "error" });
    }
  }

  async function onAccept(id: string) {
    try {
      const { data } = await acceptChallenge({ variables: { challengeId: id } });
      const gameId = data?.acceptChallenge?.id;
      if (gameId) router.push(`/game/${gameId}`);
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Couldn't accept", type: "error" });
    }
  }
  async function onDecline(id: string) {
    try {
      await declineChallenge({ variables: { challengeId: id } });
      await refetchChallenges();
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Couldn't decline", type: "error" });
    }
  }
  async function onCancel(id: string) {
    try {
      await cancelChallenge({ variables: { challengeId: id } });
      await refetchChallenges();
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Couldn't cancel", type: "error" });
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

      {/* Resume the game already under way */}
      {ongoingId && (
        <Box
          mb={{ base: 5, md: 7 }}
          position="relative"
          zIndex={1}
          p={{ base: 4, md: 5 }}
          borderRadius="12px"
          bg="rgba(212,175,55,0.10)"
          borderWidth="1px"
          borderColor="var(--lux-gold)"
        >
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <HStack gap={2.5} align="center">
              <Box w="9px" h="9px" borderRadius="full" bg="var(--lux-gold)" className="lux-pulse" />
              <Text color="var(--lux-text-primary)" fontWeight="600">You have a game in progress.</Text>
            </HStack>
            <LuxuryButton variant="gold" size="md" glyph="▸" href={`/game/${ongoingId}`}>Resume game</LuxuryButton>
          </HStack>
        </Box>
      )}

      {/* Incoming challenges — surfaced at the very top so they're impossible to miss */}
      {incoming.length > 0 && (
        <Box
          mb={{ base: 5, md: 7 }}
          position="relative"
          zIndex={1}
          p={{ base: 4, md: 5 }}
          borderRadius="12px"
          bg="rgba(212,175,55,0.08)"
          borderWidth="1px"
          borderColor="var(--lux-gold-muted)"
        >
          <HStack mb={3} gap={2} align="center">
            <Box w="8px" h="8px" borderRadius="full" bg="var(--lux-gold)" className="lux-pulse" />
            <Text color="var(--lux-gold-bright)" fontSize="sm" fontWeight="700" letterSpacing="0.06em">
              {incoming.length === 1 ? "You've been challenged" : `${incoming.length} challenges for you`}
            </Text>
          </HStack>
          <VStack align="stretch" gap={2.5}>
            {incoming.map((c) => (
              <ChallengeRow key={c.id} c={c} mine={false} onAccept={() => onAccept(c.id)} onDecline={() => onDecline(c.id)} />
            ))}
          </VStack>
        </Box>
      )}

      {/* Mode tabs */}
      <HStack mb={{ base: 5, md: 7 }} gap={2} flexWrap="wrap" position="relative" zIndex={1}>
        {(
          [
            { id: "human", label: "Human" },
            { id: "bot", label: "Engine" },
            { id: "self", label: "Self" },
          ] as { id: PlayMode; label: string }[]
        ).map((m) => (
          <ModeTab key={m.id} label={m.label} active={playMode === m.id} onClick={() => setPlayMode(m.id)} />
        ))}
      </HStack>

      {playMode === "self" && (
        <GlassCard hero>
          <Box px={{ base: 5, md: 7 }} py={{ base: 5, md: 6 }}>
            <LuxuryHeading size="md">Two players, one device.</LuxuryHeading>
            <Box mt={4}>
              <LuxuryButton variant="gold" size="md" glyph="▸" href="/play/local">Start</LuxuryButton>
            </Box>
          </Box>
        </GlassCard>
      )}

      {playMode === "bot" && (
        <VStack align="stretch" gap={{ base: 6, md: 7 }}>
          {BOT_LEVELS.map((level) => {
            const bots = BOT_PERSONAS.filter((b) => b.level === level);
            if (bots.length === 0) return null;
            return (
              <Section key={level} title={level} count={`${bots.length} bots`}>
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={2.5}>
                  {bots.map((b) => (
                    <Box
                      key={b.id}
                      as="button"
                      title={b.tagline}
                      onClick={() => router.push(`/play/bot?elo=${b.elo}&bot=${b.id}`)}
                      p={2.5}
                      borderRadius="10px"
                      bg="var(--lux-glass-surface)"
                      borderWidth="1px"
                      borderColor="var(--lux-glass-border)"
                      transition="all 0.18s"
                      _hover={{ borderColor: "var(--lux-gold)", transform: "translateY(-2px)" }}
                      style={{ backdropFilter: "blur(10px)" }}
                    >
                      <HStack gap={2.5} align="center">
                        <Box fontSize="36px" lineHeight="1" flexShrink={0}>{b.avatar}</Box>
                        <Box minW={0} textAlign="left">
                          <Text fontSize="sm" color="var(--lux-text-primary)" fontWeight="600" lineClamp={1}>
                            {b.name}
                          </Text>
                          <Text fontSize="2xs" fontWeight="700" letterSpacing="0.1em" color="var(--lux-gold-bright)">
                            {b.elo}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Section>
            );
          })}
        </VStack>
      )}

      {playMode === "human" && (
        <VStack align="stretch" gap={{ base: 6, md: 8 }}>
          {/* Create a challenge */}
          <GlassCard hero>
            <Box as="form" onSubmit={handleCreateChallenge} px={{ base: 5, md: 7 }} py={{ base: 5, md: 6 }}>
              <LuxuryHeading size="md">Challenge a player</LuxuryHeading>

              {/* Invite mode */}
              <Box mt={5}>
                <LuxuryEyebrow>Invite</LuxuryEyebrow>
                <Flex mt={2} gap={2} flexWrap="wrap">
                  <Pill active={inviteMode === "direct"} onClick={() => setInviteMode("direct")}>A player</Pill>
                  <Pill active={inviteMode === "open"} onClick={() => setInviteMode("open")}>Open link</Pill>
                </Flex>
              </Box>

              {inviteMode === "direct" && (
                <Box mt={5}>
                  <PlayerField label="Opponent" value={opponentId} onChange={setOpponentId}
                    users={users.filter((u) => u.id !== meId)} />
                </Box>
              )}

              {/* Ranked / Casual */}
              <Box mt={5}>
                <LuxuryEyebrow>Mode</LuxuryEyebrow>
                <Flex mt={2} gap={2} flexWrap="wrap">
                  <Pill active={rated} onClick={() => setRated(true)}>Ranked</Pill>
                  <Pill active={!rated} onClick={() => setRated(false)}>Casual</Pill>
                  <Text alignSelf="center" fontSize="2xs" color="var(--lux-text-muted)" letterSpacing="0.04em">
                    {rated ? "Affects your rating" : "No rating change"}
                  </Text>
                </Flex>
              </Box>

              {/* Color */}
              <Box mt={5}>
                <LuxuryEyebrow>Your Color</LuxuryEyebrow>
                <Flex mt={2} gap={2} flexWrap="wrap">
                  {(["white", "black", "random"] as const).map((c) => (
                    <Pill key={c} active={colorChoice === c} onClick={() => setColorChoice(c)}>
                      {c[0].toUpperCase() + c.slice(1)}
                    </Pill>
                  ))}
                </Flex>
              </Box>

              {/* Time control */}
              <Box mt={5}>
                <LuxuryEyebrow>Time Control</LuxuryEyebrow>
                <Flex mt={2} gap={2} flexWrap="wrap" alignItems="center">
                  {TIME_PRESETS.map((preset) => (
                    <Pill key={preset} active={timeControl === preset} onClick={() => setTimeControl(preset)} small>
                      {preset}
                    </Pill>
                  ))}
                  <Input value={timeControl} onChange={(e) => setTimeControl(e.target.value)} placeholder="10+0"
                    maxW="24" size="sm" bg="var(--lux-glass-surface)" borderColor="var(--lux-glass-border)"
                    color="var(--lux-text-primary)" borderRadius="6px" _placeholder={{ color: "var(--lux-text-muted)" }} />
                </Flex>
              </Box>

              <Box mt={6}>
                <LuxuryButton variant="gold" size="md" glyph="▸" type="submit" disabled={creating}>
                  {creating ? "Creating…" : inviteMode === "open" ? "▸ Create invite link" : "▸ Send challenge"}
                </LuxuryButton>
              </Box>

              {openLink && (
                <Box mt={5} p={4} borderRadius="8px" bg="var(--lux-glass-surface)" borderWidth="1px" borderColor="var(--lux-gold-muted)">
                  <Text fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="var(--lux-text-muted)" mb={2}>
                    Share this link — whoever opens it plays you
                  </Text>
                  <HStack gap={2} flexWrap="wrap">
                    <Text flex={1} minW="180px" fontSize="sm" color="var(--lux-gold-bright)" wordBreak="break-all">{openLink}</Text>
                    <button type="button" onClick={() => copy(openLink)} style={pillStyle(true, false)}>Copy</button>
                  </HStack>
                </Box>
              )}
            </Box>
          </GlassCard>

          {/* Your open challenges */}
          {outgoing.length > 0 && (
            <Section title="Waiting to be accepted" count={`${outgoing.length} open`}>
              <VStack align="stretch" gap={2.5}>
                {outgoing.map((c) => (
                  <ChallengeRow key={c.id} c={c} mine onCancel={() => onCancel(c.id)} onCopy={() => copy(inviteUrl(c.id))} />
                ))}
              </VStack>
            </Section>
          )}

          {/* Active games */}
          <Section title="Active" count={`${liveGames.length} live`}>
            {liveGames.length === 0 ? (
              <EmptyState text="No matches in progress." />
            ) : (
              <VStack align="stretch" gap={2.5}>
                {liveGames.map((g) => (
                  <GameRowLive key={g.id} g={g} />
                ))}
              </VStack>
            )}
          </Section>

          {/* My games */}
          <Section title="Your games" count={`${myGames.length} games`}>
            {myGames.length === 0 ? (
              <EmptyState text="No games yet — send a challenge to begin." />
            ) : (
              <VStack align="stretch" gap={2.5}>
                {myGames.slice(0, 12).map((g) => (
                  <MyGameRow key={g.id} g={g} meId={meId} />
                ))}
              </VStack>
            )}
          </Section>
        </VStack>
      )}
    </Box>
  );
}

/* ─────────── outcome model ─────────── */

type Tone = "win" | "lose" | "draw" | "live" | "pending" | "muted";
const TONE_COLOR: Record<Tone, string> = {
  win: "#3fb27f",
  lose: "#e0655c",
  draw: "#9aa3b2",
  live: "var(--lux-gold)",
  pending: "var(--lux-gold-muted)",
  muted: "var(--lux-text-muted)",
};

function outcomeFor(g: GameLite, meId?: string): { label: string; tone: Tone } {
  if (g.status === "ACTIVE") return { label: "Live", tone: "live" };
  if (g.status === "PENDING") return { label: "Ongoing", tone: "pending" };
  if (g.status === "ABANDONED" || !g.result) return { label: "Aborted", tone: "muted" };
  if (g.result === "DRAW" || g.result === "STALEMATE") return { label: "Draw", tone: "draw" };
  const iAmWhite = g.white.id === meId;
  const iWon = (g.result === "WHITE_WIN" && iAmWhite) || (g.result === "BLACK_WIN" && !iAmWhite);
  return iWon ? { label: "Won", tone: "win" } : { label: "Lost", tone: "lose" };
}

function OutcomeChip({ label, tone, pulse }: { label: string; tone: Tone; pulse?: boolean }) {
  const color = TONE_COLOR[tone];
  return (
    <HStack gap={1.5} px={2.5} py={1} borderRadius="999px" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
      <Box w="7px" h="7px" borderRadius="full" style={{ background: color, boxShadow: pulse ? `0 0 6px ${color}` : undefined }}
        className={pulse ? "lux-pulse" : undefined} />
      <Text fontFamily="var(--font-inter), sans-serif" fontSize="2xs" fontWeight="700" letterSpacing="0.16em"
        textTransform="uppercase" style={{ color }}>
        {label}
      </Text>
    </HStack>
  );
}

/* ─────────── rows ─────────── */

function MyGameRow({ g, meId }: { g: GameLite; meId?: string }) {
  const oc = outcomeFor(g, meId);
  const iAmWhite = g.white.id === meId;
  const opp = iAmWhite ? g.black : g.white;
  // Ratings as they were at the time of this game (fallback to current for older games).
  const myRatingAtGame = iAmWhite ? g.whiteRating : g.blackRating;
  const oppRatingAtGame = iAmWhite ? g.blackRating : g.whiteRating;
  return (
    <GlassCard href={`/game/${g.id}`}>
      <HStack px={5} py={3.5} justify="space-between" align="center" gap={4} flexWrap="wrap">
        <HStack gap={3} align="baseline" minW={0}>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="md" color="var(--lux-text-primary)" fontWeight="600">
            {opp?.username ?? "—"}
          </Text>
          <Text fontSize="xs" color="var(--lux-text-muted)">{oppRatingAtGame ?? opp?.rating ?? ""}</Text>
        </HStack>
        <HStack gap={3} align="center">
          {myRatingAtGame != null && (
            <Text fontFamily="var(--font-inter), sans-serif" fontSize="2xs" letterSpacing="0.1em" color="var(--lux-text-muted)" whiteSpace="nowrap">
              you · {myRatingAtGame}
            </Text>
          )}
          <Text fontFamily="var(--font-inter), sans-serif" fontSize="2xs" letterSpacing="0.16em" color="var(--lux-text-muted)">
            {g.timeControl}{!g.rated && " · Casual"}
          </Text>
          <OutcomeChip label={oc.label} tone={oc.tone} pulse={oc.tone === "live"} />
          <Text color="var(--lux-gold-muted)" fontSize="md">→</Text>
        </HStack>
      </HStack>
    </GlassCard>
  );
}

function GameRowLive({ g }: { g: GameLite }) {
  return (
    <GlassCard href={`/game/${g.id}`}>
      <HStack px={5} py={3.5} justify="space-between" align="center" gap={4} flexWrap="wrap">
        <HStack gap={3} align="center">
          <Box w="8px" h="8px" borderRadius="full" bg="var(--lux-gold)" className="lux-pulse" style={{ boxShadow: "0 0 6px var(--lux-gold)" }} />
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="md" color="var(--lux-text-primary)" fontWeight="600">
            {g.white?.username ?? "—"} vs {g.black?.username ?? "—"}
          </Text>
        </HStack>
        <HStack gap={3} align="center">
          <Text fontFamily="var(--font-inter), sans-serif" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="var(--lux-text-muted)">
            {g.timeControl}{!g.rated && " · Casual"}
          </Text>
          <Text color="var(--lux-gold-muted)" fontSize="md">→</Text>
        </HStack>
      </HStack>
    </GlassCard>
  );
}

function ChallengeRow({
  c, mine, onAccept, onDecline, onCancel, onCopy,
}: {
  c: ChallengeLite;
  mine: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onCopy?: () => void;
}) {
  const who = mine ? (c.opponent?.username ?? "Anyone (open link)") : c.creator.username;
  const rating = mine ? c.opponent?.rating : c.creator.rating;
  // Color shown is from the viewer's side.
  const myColor = mine
    ? c.creatorColor
    : c.creatorColor === "random" ? "random" : c.creatorColor === "white" ? "black" : "white";
  return (
    <GlassCard>
      <HStack px={5} py={3.5} justify="space-between" align="center" gap={3} flexWrap="wrap">
        <HStack gap={3} align="baseline" minW={0}>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="md" color="var(--lux-text-primary)" fontWeight="600">
            {who}
          </Text>
          {rating ? <Text fontSize="xs" color="var(--lux-text-muted)">{rating}</Text> : null}
          <Text fontSize="2xs" letterSpacing="0.14em" textTransform="uppercase" color="var(--lux-text-muted)">
            {c.timeControl} · {c.rated ? "Ranked" : "Casual"} · you play {myColor}
          </Text>
        </HStack>
        <HStack gap={2}>
          {!mine && onAccept && (
            <button type="button" onClick={onAccept} style={pillStyle(true, false)}>Accept</button>
          )}
          {!mine && onDecline && (
            <button type="button" onClick={onDecline} style={pillStyle(false, false)}>Decline</button>
          )}
          {mine && onCopy && !c.opponent && (
            <button type="button" onClick={onCopy} style={pillStyle(false, false)}>Copy link</button>
          )}
          {mine && onCancel && (
            <button type="button" onClick={onCancel} style={pillStyle(false, false)}>Cancel</button>
          )}
        </HStack>
      </HStack>
    </GlassCard>
  );
}

/* ─────────── primitives ─────────── */

function Section({ title, count, children }: { title: string; count: string; children: React.ReactNode }) {
  return (
    <Box>
      <HStack mb={4} align="center" gap={3}>
        <LuxuryHeading size="sm">{title}</LuxuryHeading>
        <Box flex={1} className="lux-divider" />
        <Text fontSize="2xs" color="var(--lux-text-muted)" letterSpacing="0.18em" textTransform="uppercase">{count}</Text>
      </HStack>
      {children}
    </Box>
  );
}

function pillStyle(active: boolean, small: boolean): React.CSSProperties {
  return {
    padding: small ? "8px 14px" : "8px 18px",
    borderRadius: 999,
    background: active ? "rgba(212,175,55,0.18)" : "var(--lux-glass-surface)",
    border: `1px solid ${active ? "var(--lux-gold)" : "var(--lux-glass-border)"}`,
    transition: "all 0.18s",
    cursor: "pointer",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: small ? 11 : 12,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: active ? "var(--lux-gold-bright)" : "var(--lux-text-secondary)",
  };
}

function Pill({ active, onClick, small, children }: { active: boolean; onClick: () => void; small?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={pillStyle(active, !!small)}>
      {children}
    </button>
  );
}

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box as="button" onClick={onClick} px={4} py={2.5} borderRadius="999px"
      bg={active ? "rgba(212,175,55,0.14)" : "var(--lux-glass-surface)"}
      borderWidth="1px" borderColor={active ? "var(--lux-gold)" : "var(--lux-glass-border)"}
      transition="all 0.18s" _hover={{ borderColor: "var(--lux-gold-muted)" }} style={{ backdropFilter: "blur(12px)" }}>
      <Text fontFamily="var(--font-inter), sans-serif" fontSize="xs" fontWeight="700" letterSpacing="0.2em" textTransform="uppercase"
        color={active ? "var(--lux-gold-bright)" : "var(--lux-text-secondary)"}
        style={active ? { textShadow: "0 0 6px rgba(212,175,55,0.5)" } : undefined}>
        {label}
      </Text>
    </Box>
  );
}

function PlayerField({
  label, value, onChange, users,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  users: Player[];
}) {
  return (
    <Box>
      <Text fontSize="2xs" color="var(--lux-text-muted)" letterSpacing="0.22em" textTransform="uppercase"
        fontFamily="var(--font-inter), sans-serif" mb={1.5}>
        {label}
      </Text>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: "100%", padding: "8px 12px", borderRadius: 6, background: "var(--lux-glass-surface)",
        border: "1px solid var(--lux-glass-border)", color: "var(--lux-text-primary)",
        fontFamily: "var(--font-inter), sans-serif", fontSize: 14, backdropFilter: "blur(10px)",
      }}>
        <option value="">🎲 Random opponent</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.username} ({u.rating})</option>
        ))}
      </select>
    </Box>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Box py={6} px={5} borderRadius="8px" bg="var(--lux-glass-surface)" borderWidth="1px" borderColor="var(--lux-glass-border)"
      borderStyle="dashed" textAlign="center" style={{ backdropFilter: "blur(8px)" }}>
      <Text fontSize="sm" className="lux-text-muted" letterSpacing="0.06em" fontStyle="italic">{text}</Text>
    </Box>
  );
}
