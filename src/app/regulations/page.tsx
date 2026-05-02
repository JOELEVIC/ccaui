"use client";

import { Box, Container, Heading, Text, VStack, ListRoot, ListItem, SimpleGrid } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LandingNav } from "@/components/home/LandingNav";
import { LandingFooter } from "@/components/home/LandingFooter";
import { PageHeader } from "@/components/common/PageHeader";
import { fadeInUp, defaultViewport } from "@/lib/animations";

const PRINCIPLES = [
  {
    title: "Fair Play",
    body:
      "All games are played in good faith. Engine assistance, external help, or pre-arranged results are strictly forbidden and result in immediate disqualification.",
  },
  {
    title: "Respect & Sportsmanship",
    body:
      "Treat opponents, arbiters, and spectators with respect. Disputes are raised calmly through arbiters or the academy support channel — not on the board.",
  },
  {
    title: "Punctuality",
    body:
      "Players who arrive more than 5 minutes late for an arena round forfeit that round. Players who default twice in a tournament are removed from the event.",
  },
  {
    title: "Honest Reporting",
    body:
      "Results are recorded as they happen. Falsified results, double entries, or impersonation are grounds for permanent rating removal.",
  },
];

const ARENA_RULES = [
  "Time control follows FIDE handicap rules (Bullet 1+0, Blitz 3+2, Rapid 15+10) unless otherwise stated.",
  "Touch-move applies in over-the-board tournaments. On the platform, drag-and-drop is final once released on a square.",
  "A draw can be claimed under threefold repetition or 50-move rule via the in-game UI.",
  "Disconnections under 60 seconds resume automatically. Beyond that, the round is awarded to the connected player unless an arbiter intervenes.",
  "Arena tie-breaks: Buchholz Cut-1, then Sonneborn-Berger, then direct encounter, then drawing of lots.",
];

const RATINGS = [
  "Initial rating is 1200 after 3 rated games (provisional).",
  "K-factor: 40 (under 18 games), 25 (≤ 2300), 15 (above 2300).",
  "Variant ratings (Blitz, Bullet, Rapid, Classical) are tracked independently.",
  "Inactivity: ratings decay by 25 points after 12 months of inactivity, restored on first rated game.",
];

const SCHOOL_TOURNAMENTS = [
  "Each school enters at least one team of 4 (board 1 highest-rated).",
  "Substitutions allowed before round 1 — no substitutions after the first move of round 1.",
  "Coaches may not analyse with players during a round.",
  "School points = total individual points across boards. Tie-breakers as in arena rules above.",
];

const CODE_OF_CONDUCT = [
  "No insults, harassment, or discrimination on any platform channel.",
  "No external coaching, engine, or database access during rated play or tournaments.",
  "No multiple accounts. Penalty: deletion of duplicate accounts and rating reset.",
  "Streaming: allowed with 30-minute delay during rated tournaments.",
];

export default function RegulationsPage() {
  return (
    <Box minH="100vh" bg="bgDark" color="white" display="flex" flexDir="column">
      <LandingNav />
      <Box flex={1} py={{ base: 8, md: 14 }}>
        <Container maxW="4xl" px={{ base: 4, md: 6 }}>
          <PageHeader
            label="Official standards"
            title="Academy regulations"
            subtitle="The rules that govern fair play, ratings, tournaments, and conduct on every Cameroon Chess Academy event and platform game."
          />

          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
            <Heading size="md" color="gold" mt={10} mb={4} fontFamily="var(--font-playfair), Georgia, serif">
              Guiding principles
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {PRINCIPLES.map((p) => (
                <Box
                  key={p.title}
                  p={5}
                  bg="bgCard"
                  borderRadius="soft"
                  borderWidth="1px"
                  borderColor="goldDark"
                >
                  <Text color="gold" fontWeight="700" mb={1.5}>
                    {p.title}
                  </Text>
                  <Text color="textSecondary" fontSize="sm" lineHeight="1.65">
                    {p.body}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </motion.div>

          <Section title="Arena & tournament rules">
            <ListRoot gap={2} color="textSecondary">
              {ARENA_RULES.map((rule) => (
                <ListItem key={rule}>{rule}</ListItem>
              ))}
            </ListRoot>
          </Section>

          <Section title="Rating system">
            <ListRoot gap={2} color="textSecondary">
              {RATINGS.map((r) => (
                <ListItem key={r}>{r}</ListItem>
              ))}
            </ListRoot>
          </Section>

          <Section title="School tournaments">
            <ListRoot gap={2} color="textSecondary">
              {SCHOOL_TOURNAMENTS.map((r) => (
                <ListItem key={r}>{r}</ListItem>
              ))}
            </ListRoot>
          </Section>

          <Section title="Code of conduct">
            <ListRoot gap={2} color="textSecondary">
              {CODE_OF_CONDUCT.map((r) => (
                <ListItem key={r}>{r}</ListItem>
              ))}
            </ListRoot>
          </Section>

          <Section title="Disputes & appeals">
            <Text color="textSecondary" lineHeight="1.7">
              Concerns raised during a tournament are decided by the on-site arbiter. Off-platform disputes may be appealed
              within 7 days to <strong>arbiters@dchessacademy.com</strong>. The Appeals Committee&apos;s decision is final.
              Major decisions (account bans, rating resets, disqualifications) may be referred to the Federation as needed.
            </Text>
          </Section>

          <Section title="Privacy & data">
            <Text color="textSecondary" lineHeight="1.7">
              We store the minimum data needed to run rated games, tournaments, and school programmes: account info,
              ratings, and game history. We do not sell or share personal data. Players may request deletion of their
              account and game history at any time via{" "}
              <a
                href="mailto:privacy@dchessacademy.com"
                style={{ color: "var(--chakra-colors-gold)", textDecoration: "underline" }}
              >
                privacy@dchessacademy.com
              </a>
              .
            </Text>
          </Section>

          <Box mt={10} pt={6} borderTopWidth="1px" borderColor="whiteAlpha.080">
            <Text color="textMuted" fontSize="xs">
              These regulations are reviewed annually by the academy committee. Effective from January 2026. Last
              updated: 2026.
            </Text>
          </Box>
        </Container>
      </Box>
      <LandingFooter />
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
      <Box mt={10}>
        <Heading
          size="md"
          color="gold"
          mb={3}
          pb={2}
          borderBottomWidth="1px"
          borderColor="goldDark"
          fontFamily="var(--font-playfair), Georgia, serif"
        >
          {title}
        </Heading>
        <VStack align="stretch" gap={3}>
          {children}
        </VStack>
      </Box>
    </motion.div>
  );
}
