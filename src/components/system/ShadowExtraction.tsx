"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  SystemPanel,
  SystemButton,
  SystemLabel,
  SYSTEM_KEYFRAMES,
} from "./SystemPrimitives";
import { ManaBurst } from "./ManaBeam";
import { ClassicBoard } from "./ClassicBoard";

/**
 * Shadow Extraction — turns a missed "Brilliant Move" into a collectible
 * puzzle. The player is shown the position where they could have played a
 * standout move; they have to find it to "extract the shadow" (claim it
 * for their inventory).
 *
 * On a real game-review pipeline, ShadowCandidate objects are produced by
 * the engine when accuracy > 95% and the move is in the top-1 of multipv,
 * AND the human chose differently. Here we expose the component cleanly so
 * it can be plugged into that pipeline later.
 */

export interface ShadowCandidate {
  id: string;
  /** FEN before the move that should have been played. */
  fen: string;
  /** Expected move in SAN (e.g. "Nxf7+", "Qh5#"). */
  expectedSan: string;
  /** Short label shown in the inventory list. */
  label: string;
  /** Source game URL (e.g. Chess.com) for review. */
  sourceUrl?: string;
  /** Optional system flavour text. */
  flavour?: string;
}

export interface ExtractedShadow extends ShadowCandidate {
  extractedAt: string;
  /** Move count tried before solving. */
  attempts: number;
}

interface ShadowExtractionProps {
  candidate: ShadowCandidate;
  /** Called when the user extracts the shadow. Persist to inventory upstream. */
  onExtract?: (s: ExtractedShadow) => void;
  /** Called when the user gives up. */
  onSkip?: () => void;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function ShadowExtraction({ candidate, onExtract, onSkip }: ShadowExtractionProps) {
  const [from, setFrom] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [extracted, setExtracted] = useState(false);

  const chess = useMemo(() => {
    try {
      return new Chess(candidate.fen);
    } catch {
      return new Chess();
    }
  }, [candidate.fen]);
  const turn = chess.turn(); // 'w' | 'b'
  const boardMatrix = chess.board();
  const boardOrientation: "white" | "black" = turn === "w" ? "white" : "black";

  function tryMove(to: string) {
    if (!from) return;
    const test = new Chess(candidate.fen);
    let result;
    try {
      // chess.js v1 accepts promotion as 'q' by default for pawn promotions
      result = test.move({ from, to, promotion: "q" });
    } catch {
      result = null;
    }
    setAttempts((a) => a + 1);
    if (result && result.san === candidate.expectedSan) {
      setExtracted(true);
      onExtract?.({
        ...candidate,
        extractedAt: new Date().toISOString(),
        attempts: attempts + 1,
      });
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 400);
    }
    setFrom(null);
  }

  function onSquareClick(sq: string) {
    if (extracted) return;
    if (!from) {
      // Only allow picking up a piece of the side to move.
      const file = FILES.indexOf(sq[0] as (typeof FILES)[number]);
      const rank = parseInt(sq[1], 10);
      const piece = boardMatrix[8 - rank]?.[file];
      if (!piece) return;
      if (piece.color !== turn) return;
      setFrom(sq);
      return;
    }
    if (sq === from) {
      setFrom(null);
      return;
    }
    tryMove(sq);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <SystemPanel accent="epic" glow="strong" brackets p={{ base: 5, md: 7 }}>
        <VStack align="stretch" gap={5}>
          <HStack justify="space-between" flexWrap="wrap" gap={3} align="flex-start">
            <Box>
              <SystemLabel accent="epic">[ Shadow Extraction ]</SystemLabel>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "2xl", md: "3xl" }}
                color="textPrimary"
                fontWeight="700"
                mt={1}
              >
                {candidate.label}
              </Text>
              <Text fontSize="sm" color="textSecondary" mt={1}>
                You missed this move in a real game. Find it to claim the shadow.
              </Text>
              {candidate.flavour && (
                <Text fontSize="xs" color="sysEpic" fontStyle="italic" mt={1}>
                  {candidate.flavour}
                </Text>
              )}
            </Box>
            <Box
              px={3}
              py={1.5}
              borderWidth="1px"
              borderColor="rgba(177,151,252,0.55)"
              bg="rgba(10,11,14,0.55)"
              className="sys-clip-panel-sm"
            >
              <Text fontSize="2xs" color="textMuted" letterSpacing="0.2em" textTransform="uppercase">
                Side to move
              </Text>
              <Text fontSize="md" fontWeight="800" color="sysEpic" textTransform="uppercase">
                {turn === "w" ? "White" : "Black"}
              </Text>
            </Box>
          </HStack>

          <HStack
            gap={6}
            align="flex-start"
            flexWrap={{ base: "wrap", lg: "nowrap" }}
            justify={{ base: "center", lg: "flex-start" }}
          >
            <BoardFrame extracted={extracted} wrongFlash={wrongFlash}>
              <ClassicBoard
                fen={chess.fen()}
                orientation={boardOrientation}
                size={384}
                onSquareClick={onSquareClick}
                squareStyles={
                  from
                    ? {
                        [from]: {
                          background:
                            "radial-gradient(circle, rgba(177,151,252,0.55) 0%, rgba(177,151,252,0.25) 80%)",
                          boxShadow: "inset 0 0 0 2px var(--sys-epic)",
                        },
                      }
                    : undefined
                }
              />
            </BoardFrame>

            <VStack flex={1} align="stretch" gap={4} minW={{ base: "full", lg: "260px" }}>
              <Box
                p={3}
                borderWidth="1px"
                borderColor="rgba(177,151,252,0.4)"
                bg="rgba(10,11,14,0.55)"
                className="sys-clip-panel-sm"
              >
                <SystemLabel accent="epic">Extraction Log</SystemLabel>
                <Text fontSize="sm" color="textSecondary" mt={2}>
                  Attempts:{" "}
                  <Box as="span" color="textPrimary" fontWeight="700">
                    {attempts}
                  </Box>
                </Text>
                {extracted && (
                  <Text fontSize="lg" color="sysEpic" fontWeight="800" mt={2} style={{ textShadow: "0 0 8px var(--sys-epic)" }}>
                    Shadow extracted · {candidate.expectedSan}
                  </Text>
                )}
                {!extracted && attempts >= 3 && (
                  <Text fontSize="xs" color="sysThreat" mt={2}>
                    System hint: the move ends with a piece type of <b>{candidate.expectedSan[0]}</b>.
                  </Text>
                )}
              </Box>

              <VStack align="stretch" gap={2}>
                {!extracted && (
                  <SystemButton accent="purple" size="md" onClick={onSkip}>
                    Abandon Shadow
                  </SystemButton>
                )}
                {extracted && candidate.sourceUrl && (
                  <SystemButton accent="cyan" size="md" href={candidate.sourceUrl}>
                    Review Source Game
                  </SystemButton>
                )}
              </VStack>
            </VStack>
          </HStack>
        </VStack>
      </SystemPanel>
    </>
  );
}

function BoardFrame({
  extracted,
  wrongFlash,
  children,
}: {
  extracted: boolean;
  wrongFlash: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      position="relative"
      p={2}
      borderWidth="1px"
      borderColor={extracted ? "var(--sys-epic)" : wrongFlash ? "var(--sys-threat)" : "rgba(177,151,252,0.6)"}
      bg="rgba(10,11,14,0.6)"
      backdropFilter="blur(10px)"
      style={{
        boxShadow: extracted
          ? "0 0 28px var(--sys-epic)"
          : wrongFlash
            ? "0 0 28px var(--sys-threat)"
            : "0 0 22px rgba(177,151,252,0.35), inset 0 0 22px rgba(177,151,252,0.06)",
        transition: "all 0.18s",
      }}
      className="sys-clip-panel"
      flexShrink={0}
    >
      {children}
      <AnimatePresence>
        {extracted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <ManaBurst size={120} color="var(--sys-epic)" duration={1.2} />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

/* ───────────────────────────────────────────────────────────────────
 * ShadowCollection — inventory grid of extracted shadows.
 * ─────────────────────────────────────────────────────────────────── */

export function ShadowCollection({ shadows }: { shadows: ExtractedShadow[] }) {
  if (shadows.length === 0) {
    return (
      <SystemPanel accent="epic" glow="soft" p={5}>
        <SystemLabel accent="epic">[ Shadow Collection ]</SystemLabel>
        <Text mt={2} color="textSecondary">
          No shadows extracted yet. Review your losses — every missed brilliant move can be claimed.
        </Text>
      </SystemPanel>
    );
  }
  return (
    <SystemPanel accent="epic" glow="soft" p={5}>
      <HStack justify="space-between" mb={3}>
        <SystemLabel accent="epic">[ Shadow Collection ]</SystemLabel>
        <Text fontSize="xs" color="textMuted">
          {shadows.length} shadow{shadows.length === 1 ? "" : "s"} claimed
        </Text>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
        {shadows.map((s) => (
          <Box
            key={s.id}
            p={3}
            bg="rgba(177,151,252,0.06)"
            borderWidth="1px"
            borderColor="rgba(177,151,252,0.4)"
            className="sys-clip-panel-sm"
            transition="all 0.15s"
            _hover={{ borderColor: "var(--sys-epic)", boxShadow: "var(--sys-glow-epic)" }}
          >
            <Text fontFamily="var(--font-playfair), Georgia, serif" fontWeight="700" color="textPrimary">
              {s.label}
            </Text>
            <HStack gap={2} mt={1} justify="space-between">
              <Text fontSize="xs" color="sysEpic" fontWeight="700">
                {s.expectedSan}
              </Text>
              <Text fontSize="2xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
                {s.attempts} attempt{s.attempts === 1 ? "" : "s"}
              </Text>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>
    </SystemPanel>
  );
}

/* ───────────────────────────────────────────────────────────────────
 * useShadowInventory — minimal localStorage-backed collection hook.
 * ─────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "cca:r2m:shadows";

export function useShadowInventory(): {
  shadows: ExtractedShadow[];
  add: (s: ExtractedShadow) => void;
  clear: () => void;
} {
  const [shadows, setShadows] = useState<ExtractedShadow[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setShadows(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function persist(next: ExtractedShadow[]) {
    setShadows(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
    }
  }

  function add(s: ExtractedShadow) {
    // de-dupe on id
    persist([s, ...shadows.filter((x) => x.id !== s.id)]);
  }

  function clear() {
    persist([]);
  }

  return { shadows, add, clear };
}
