"use client";

import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { SystemPanel, SystemLabel, SystemButton, SYSTEM_KEYFRAMES } from "./SystemPrimitives";

/**
 * Guild Board — regional Guild competition for Cameroon.
 *
 * Each district is a "Guild" the player contributes XP to. The board ranks
 * guilds by aggregate XP and renders a "battle bar" that fills with the
 * region's faction colour. Tap a district to see its top hunters.
 */

export interface DistrictGuild {
  id: string;
  name: string;
  /** Faction tag — three-letter code on the badge. */
  tag: string;
  /** Total XP contributed by hunters from this district. */
  xp: number;
  /** Active hunter count. */
  hunters: number;
  /** Hex colour used as the guild banner. */
  banner: string;
  /** Optional "captain" — the highest-XP hunter in the guild. */
  captain?: { name: string; rank: string };
  /** Distinct flavour caption. */
  motto: string;
}

/**
 * Cameroon's 10 regions, used as the default guild set. Banner colours
 * borrow loosely from the national palette + System tones so the board
 * stays cohesive when sat next to other System panels.
 */
export const CAMEROON_GUILDS: DistrictGuild[] = [
  { id: "littoral",   name: "Douala · Littoral",        tag: "DLA", xp: 184320, hunters: 412, banner: "#00F0FF", motto: "Where the port meets the queen's gambit." },
  { id: "centre",     name: "Yaoundé · Centre",         tag: "YDE", xp: 162900, hunters: 388, banner: "#8A2BE2", motto: "Seven hills, one strategy." },
  { id: "west",       name: "Bafoussam · West",         tag: "BFS", xp:  98480, hunters: 221, banner: "#F06595", motto: "Highland calculation." },
  { id: "northwest",  name: "Bamenda · North-West",     tag: "BAM", xp:  87220, hunters: 198, banner: "#B197FC", motto: "Ring road of resilience." },
  { id: "southwest",  name: "Buea · South-West",        tag: "BUE", xp:  74100, hunters: 162, banner: "#a3e635", motto: "Beneath Fako, no fear." },
  { id: "north",      name: "Garoua · North",           tag: "GAR", xp:  61500, hunters: 142, banner: "#fb923c", motto: "Desert wins are the cleanest." },
  { id: "south",      name: "Ebolowa · South",          tag: "EBO", xp:  48820, hunters: 119, banner: "#f5c244", motto: "Slow forest. Deep plans." },
  { id: "east",       name: "Bertoua · East",           tag: "BER", xp:  41040, hunters:  98, banner: "#22d3ee", motto: "Quiet rooks, loud rivers." },
  { id: "adamawa",    name: "Ngaoundéré · Adamawa",     tag: "NGA", xp:  34800, hunters:  86, banner: "#e6a452", motto: "The plateau remembers." },
  { id: "far-north",  name: "Maroua · Far-North",       tag: "MAR", xp:  28110, hunters:  72, banner: "#f472b6", motto: "Heat-tempered tactics." },
];

interface GuildBoardProps {
  guilds?: DistrictGuild[];
  /** Player's current guild id — highlighted on the board. */
  myGuildId?: string;
  /** "Contribute XP" handler — opens a join/contribute flow upstream. */
  onContribute?: (g: DistrictGuild) => void;
}

export function GuildBoard({
  guilds = CAMEROON_GUILDS,
  myGuildId,
  onContribute,
}: GuildBoardProps) {
  const sorted = [...guilds].sort((a, b) => b.xp - a.xp);
  const maxXp = Math.max(...sorted.map((g) => g.xp), 1);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <SystemPanel accent="purple" glow="soft" brackets p={{ base: 5, md: 7 }}>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Box>
              <SystemLabel accent="purple">[ Guild Conclave · Cameroon ]</SystemLabel>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "2xl", md: "3xl" }}
                color="textPrimary"
                fontWeight="700"
                mt={1}
              >
                Districts at War
              </Text>
              <Text fontSize="sm" color="textSecondary" mt={1}>
                Every XP you earn contributes to your guild. Top districts unlock seasonal banners.
              </Text>
            </Box>
            <SimpleGrid columns={3} gap={2} minW={{ base: "full", md: "240px" }}>
              <StatStrip label="Guilds" value={String(guilds.length)} />
              <StatStrip
                label="Hunters"
                value={String(guilds.reduce((s, g) => s + g.hunters, 0).toLocaleString())}
              />
              <StatStrip
                label="Aggregate XP"
                value={Intl.NumberFormat("en", { notation: "compact" }).format(
                  guilds.reduce((s, g) => s + g.xp, 0)
                )}
              />
            </SimpleGrid>
          </HStack>

          <VStack align="stretch" gap={2}>
            {sorted.map((g, idx) => (
              <GuildRow
                key={g.id}
                guild={g}
                rank={idx + 1}
                pctOfLeader={g.xp / maxXp}
                isMine={myGuildId === g.id}
                onContribute={onContribute ? () => onContribute(g) : undefined}
              />
            ))}
          </VStack>
        </VStack>
      </SystemPanel>
    </>
  );
}

function GuildRow({
  guild,
  rank,
  pctOfLeader,
  isMine,
  onContribute,
}: {
  guild: DistrictGuild;
  rank: number;
  pctOfLeader: number;
  isMine: boolean;
  onContribute?: () => void;
}) {
  const rankBadge = rank === 1 ? "S" : rank === 2 ? "A" : rank === 3 ? "B" : "C";
  return (
    <Box
      position="relative"
      p={3}
      bg={isMine ? "rgba(138,43,226,0.10)" : "rgba(10,11,14,0.6)"}
      borderWidth="1px"
      borderColor={isMine ? "var(--sys-purple)" : "rgba(177,151,252,0.18)"}
      className="sys-clip-panel-sm"
      transition="all 0.15s"
      _hover={{ borderColor: guild.banner, transform: "translateX(2px)" }}
      style={{ boxShadow: isMine ? "0 0 12px rgba(138,43,226,0.4)" : "none" }}
    >
      <HStack gap={3} align="center">
        {/* Rank badge */}
        <Box
          position="relative"
          w="40px"
          h="40px"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box className="sys-clip-hex" position="absolute" inset={0} bg={guild.banner} filter={`drop-shadow(0 0 6px ${guild.banner})`} />
          <Box className="sys-clip-hex" position="absolute" inset="2px" bg="var(--sys-void)" />
          <Text
            position="relative"
            fontFamily="var(--font-playfair), Georgia, serif"
            color={guild.banner}
            fontWeight="800"
            fontSize="lg"
            textShadow={`0 0 6px ${guild.banner}`}
            zIndex={1}
          >
            {rankBadge}
          </Text>
        </Box>

        {/* Faction tag */}
        <Box
          w="48px"
          flexShrink={0}
          textAlign="center"
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          fontSize="sm"
          fontWeight="800"
          letterSpacing="0.12em"
          color={guild.banner}
          textShadow={`0 0 4px ${guild.banner}`}
        >
          {guild.tag}
        </Box>

        {/* Bar */}
        <Box flex={1} minW={0}>
          <HStack justify="space-between" mb={1}>
            <Box>
              <Text fontFamily="var(--font-playfair), Georgia, serif" fontWeight="700" color="textPrimary" lineHeight="1.1">
                {guild.name}
              </Text>
              <Text fontSize="2xs" color="textMuted" fontStyle="italic">
                “{guild.motto}”
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="xs" color="textMuted" fontFamily="var(--font-oswald), var(--font-inter), sans-serif" letterSpacing="wider">
                {guild.hunters.toLocaleString()} hunters
              </Text>
              <Text fontSize="md" color={guild.banner} fontWeight="800" fontFamily="var(--font-oswald), var(--font-inter), sans-serif" style={{ textShadow: `0 0 4px ${guild.banner}` }}>
                {guild.xp.toLocaleString()} XP
              </Text>
            </Box>
          </HStack>
          <Box position="relative" h="5px" bg="rgba(255,255,255,0.05)" borderRadius="2px" overflow="hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctOfLeader * 100}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                background: guild.banner,
                boxShadow: `0 0 6px ${guild.banner}`,
              }}
            />
          </Box>
        </Box>

        {onContribute && (
          <Box flexShrink={0}>
            <SystemButton accent="purple" size="md" onClick={onContribute}>
              {isMine ? "Boost" : "Defect"}
            </SystemButton>
          </Box>
        )}
      </HStack>
    </Box>
  );
}

function StatStrip({ label, value }: { label: string; value: string }) {
  return (
    <Box
      px={3}
      py={2}
      borderWidth="1px"
      borderColor="rgba(177,151,252,0.3)"
      bg="rgba(10,11,14,0.55)"
      className="sys-clip-panel-sm"
    >
      <Text fontSize="2xs" color="textMuted" letterSpacing="0.2em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
        {label}
      </Text>
      <Text fontSize="lg" color="sysEpic" fontWeight="800" lineHeight="1" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
        {value}
      </Text>
    </Box>
  );
}
