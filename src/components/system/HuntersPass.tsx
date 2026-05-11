"use client";

import { useState } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  SystemPanel,
  SystemButton,
  SystemLabel,
  SYSTEM_KEYFRAMES,
} from "./SystemPrimitives";

/**
 * Hunter's Pass — paid-tier checkout stub.
 *
 * Renders a chamfered pass card with the player's pseudonym + level, the
 * benefit list, and a region-aware checkout button. We support two
 * processors with mocked client-side handlers; the real integration lands
 * server-side on the backend.
 *
 *   • Stripe       — global card payments.
 *   • Flutterwave  — Mobile Money + cards in Africa (default for Cameroon).
 *
 * The component exposes `onCheckout({ processor, plan })` so the page can
 * forward to the real flow.
 */

export type PassProcessor = "stripe" | "flutterwave";
export type PassPlan = "monthly" | "season" | "lifetime";

export interface HuntersPassPlan {
  id: PassPlan;
  /** Headline label e.g. "Season Pass". */
  label: string;
  /** Subheader e.g. "3 months · 1 season". */
  cadence: string;
  /** XAF (CFA franc) price. */
  priceXaf: number;
  /** USD price for the Stripe path. */
  priceUsd: number;
  /** Recommendation tag, if any. */
  badge?: string;
}

export const DEFAULT_PLANS: HuntersPassPlan[] = [
  {
    id: "monthly",
    label: "Hunter's Trial",
    cadence: "1 month",
    priceXaf: 2500,
    priceUsd: 5,
  },
  {
    id: "season",
    label: "Season Pass",
    cadence: "3 months · 1 season",
    priceXaf: 6000,
    priceUsd: 12,
    badge: "Most Picked",
  },
  {
    id: "lifetime",
    label: "Monarch Pass",
    cadence: "lifetime · highest tier",
    priceXaf: 49000,
    priceUsd: 99,
    badge: "Prestige",
  },
];

interface HuntersPassProps {
  username: string;
  rank: string;
  level: number;
  /** XAF is default; flip to USD for non-CM users. */
  currency?: "XAF" | "USD";
  plans?: HuntersPassPlan[];
  /** Pre-select a plan. */
  initialPlan?: PassPlan;
  onCheckout?: (args: { processor: PassProcessor; plan: HuntersPassPlan }) => Promise<void> | void;
}

const BENEFITS: { label: string; detail: string }[] = [
  { label: "Class Recalibration",  detail: "Unlimited Chess.com syncs (free tier: weekly)." },
  { label: "Shadow Slot · ×3",     detail: "Three shadow extractions per day instead of one." },
  { label: "Red Gate Insight",     detail: "Engine-tagged hints inside boss puzzles." },
  { label: "Guild Boost ×1.5",     detail: "All XP you earn counts 1.5× toward your district." },
  { label: "Custom Hunter Sigil",  detail: "Unlock alternate frame designs for the Status Window." },
  { label: "Priority Coaching",    detail: "Match requests with CCA coaches appear at the top of the queue." },
];

export function HuntersPass({
  username,
  rank,
  level,
  currency = "XAF",
  plans = DEFAULT_PLANS,
  initialPlan = "season",
  onCheckout,
}: HuntersPassProps) {
  const [selected, setSelected] = useState<PassPlan>(initialPlan);
  const [processing, setProcessing] = useState<PassProcessor | null>(null);

  const plan = plans.find((p) => p.id === selected) ?? plans[0];

  async function handleCheckout(processor: PassProcessor) {
    if (!onCheckout) return;
    setProcessing(processor);
    try {
      await onCheckout({ processor, plan });
    } finally {
      setProcessing(null);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <SystemPanel accent="gold" glow="strong" brackets p={{ base: 5, md: 7 }}>
        <VStack align="stretch" gap={5}>
          <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
            <Box>
              <SystemLabel accent="gold">[ Hunter&apos;s Pass ]</SystemLabel>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "2xl", md: "3xl" }}
                color="textPrimary"
                fontWeight="700"
                mt={1}
              >
                Forge your path. Faster.
              </Text>
              <Text fontSize="sm" color="textSecondary" mt={1}>
                Optional. Free hunters keep every core dungeon — the Pass amplifies the climb.
              </Text>
            </Box>
            <LicenceMini username={username} rank={rank} level={level} />
          </HStack>

          {/* Plan picker */}
          <Box>
            <SystemLabel accent="gold">Choose a Plan</SystemLabel>
            <HStack mt={2} gap={2} flexWrap="wrap">
              {plans.map((p) => {
                const active = selected === p.id;
                return (
                  <Box
                    key={p.id}
                    as="button"
                    onClick={() => setSelected(p.id)}
                    p={3}
                    minW="180px"
                    flex="1"
                    borderWidth="1px"
                    borderColor={active ? "var(--sys-prestige-gold)" : "rgba(245,194,68,0.25)"}
                    bg={active ? "rgba(245,194,68,0.08)" : "rgba(10,11,14,0.55)"}
                    className="sys-clip-panel-sm"
                    cursor="pointer"
                    transition="all 0.15s"
                    style={{ boxShadow: active ? "var(--sys-glow-prestige)" : "none" }}
                  >
                    <HStack justify="space-between">
                      <Text fontFamily="var(--font-playfair), Georgia, serif" fontWeight="700" color="textPrimary">
                        {p.label}
                      </Text>
                      {p.badge && (
                        <Text fontSize="2xs" color="sys.prestige" fontWeight="800" letterSpacing="wider" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
                          {p.badge}
                        </Text>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="textMuted">
                      {p.cadence}
                    </Text>
                    <Text mt={1} fontSize="xl" color="sys.prestige" fontWeight="800" fontFamily="var(--font-oswald), var(--font-inter), sans-serif" style={{ textShadow: "0 0 6px var(--sys-prestige-gold)" }}>
                      {currency === "XAF"
                        ? `${p.priceXaf.toLocaleString("en-CM")} XAF`
                        : `$${p.priceUsd}`}
                    </Text>
                  </Box>
                );
              })}
            </HStack>
          </Box>

          {/* Benefits */}
          <Box>
            <SystemLabel accent="gold">Pass Benefits</SystemLabel>
            <VStack mt={2} align="stretch" gap={1.5}>
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <HStack
                    gap={3}
                    px={3}
                    py={2}
                    bg="rgba(245,194,68,0.04)"
                    borderWidth="1px"
                    borderColor="rgba(245,194,68,0.2)"
                  >
                    <Text fontSize="md" color="sys.prestige" lineHeight="1">
                      ✦
                    </Text>
                    <Box flex={1}>
                      <Text fontSize="sm" color="textPrimary" fontWeight="700" fontFamily="var(--font-oswald), var(--font-inter), sans-serif" letterSpacing="0.06em">
                        {b.label}
                      </Text>
                      <Text fontSize="xs" color="textSecondary">
                        {b.detail}
                      </Text>
                    </Box>
                  </HStack>
                </motion.div>
              ))}
            </VStack>
          </Box>

          {/* Checkout */}
          <Box>
            <SystemLabel accent="gold">Payment Method</SystemLabel>
            <HStack mt={2} gap={2} flexWrap="wrap">
              <SystemButton
                accent="gold"
                size="lg"
                onClick={() => handleCheckout("flutterwave")}
                disabled={processing !== null}
              >
                {processing === "flutterwave" ? "Opening…" : "Pay with Flutterwave"}
              </SystemButton>
              <SystemButton
                accent="cyan"
                size="lg"
                onClick={() => handleCheckout("stripe")}
                disabled={processing !== null}
              >
                {processing === "stripe" ? "Opening…" : "Pay with Stripe"}
              </SystemButton>
            </HStack>
            <Text fontSize="2xs" color="textMuted" mt={3} fontStyle="italic">
              Secure checkout · You will be redirected to the processor. Pricing in {currency}.
              Payments are processed by Stripe or Flutterwave — your card never touches CCA servers.
            </Text>
          </Box>
        </VStack>
      </SystemPanel>
    </>
  );
}

function LicenceMini({ username, rank, level }: { username: string; rank: string; level: number }) {
  return (
    <Box
      p={3}
      minW="220px"
      borderWidth="1px"
      borderColor="rgba(245,194,68,0.45)"
      bg="rgba(10,11,14,0.6)"
      className="sys-clip-panel-sm"
      style={{ boxShadow: "var(--sys-glow-prestige)" }}
    >
      <SystemLabel accent="gold">Licence</SystemLabel>
      <HStack mt={1.5} justify="space-between" align="flex-end">
        <Box>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="lg" color="textPrimary" fontWeight="700" lineHeight="1">
            {username}
          </Text>
          <Text fontSize="2xs" color="textMuted" letterSpacing="0.18em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
            {rank}-Rank · Lv {level}
          </Text>
        </Box>
        <Text fontSize="2xl" color="sys.prestige" lineHeight="1" style={{ textShadow: "0 0 8px var(--sys-prestige-gold)" }}>
          ✶
        </Text>
      </HStack>
    </Box>
  );
}

/**
 * Default no-op handler — useful while wiring the page before the backend
 * checkout flow exists. Logs the chosen plan + processor and resolves.
 */
export async function stubHuntersPassCheckout({
  processor,
  plan,
}: {
  processor: PassProcessor;
  plan: HuntersPassPlan;
}): Promise<void> {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.info("[HuntersPass] checkout stub", { processor, plan });
    window.alert(
      `Checkout stub: ${processor.toUpperCase()} · ${plan.label} · ${plan.priceXaf.toLocaleString()} XAF\n` +
        "Wire this up to /api/billing/checkout to complete the integration."
    );
  }
  return Promise.resolve();
}
