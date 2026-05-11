"use client";

import { useMemo, useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import {
  ShadowCollection,
  ShadowExtraction,
  useShadowInventory,
  type ShadowCandidate,
} from "@/components/system/ShadowExtraction";

/**
 * Demo Shadow Extraction page.
 *
 * A real implementation would pull candidates from the user's reviewed games
 * (every position where they were >0.5 from the engine's top line and that
 * top line resulted in mate / a +3 evaluation jump). For the scaffolding,
 * we ship three canonical brilliant-move positions so the flow is testable.
 */

const DEMO_CANDIDATES: ShadowCandidate[] = [
  {
    id: "fischer-byrne-1956",
    label: "The Game of the Century — Byrne vs Fischer",
    // Position after 17. Kf1, Black to move. Fischer played 17...Be6!! —
    // offering his queen for a long combination that ends in mate.
    fen: "r3r1k1/pp3pbp/1qp3p1/2B5/2BP2b1/Q1n2N2/P4PPP/3R1K1R b - - 0 17",
    expectedSan: "Be6",
    flavour: "Fischer, age 13. Offers the queen for an immortal combination.",
    sourceUrl: "https://www.chessgames.com/perl/chessgame?gid=1008361",
  },
  {
    id: "philidors-legacy",
    label: "Philidor's Legacy — Smothered Mate",
    // Knight on h6, black king already cornered on h8 with rook on g8 +
    // pawns on g7 and h7 blocking every flight. Nf7 delivers the textbook
    // smothered mate.
    fen: "6rk/6pp/7N/8/8/8/8/7K w - - 0 1",
    expectedSan: "Nf7#",
    flavour: "Knight on h6, king in the corner. End the night with elegance.",
  },
  {
    id: "greek-gift-template",
    label: "Greek Gift — Classical Sacrifice",
    // Black has just castled. Bd3 hits h7 with the king now on g8 —
    // classical Greek gift sacrifice opens the attack.
    fen: "r1bq1rk1/ppp2ppp/2nb1n2/3pp3/3P4/2NBPN2/PPP2PPP/R1BQK2R w KQ - 0 6",
    expectedSan: "Bxh7+",
    flavour: "Once the king sits on g8, the diagonal b1–h7 becomes a runway.",
  },
];

export default function ShadowPage() {
  const inventory = useShadowInventory();
  const [idx, setIdx] = useState(0);
  const current = useMemo(() => DEMO_CANDIDATES[idx % DEMO_CANDIDATES.length], [idx]);

  if (!current) return null;

  return (
    <Box bg="sys.void" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
      <VStack maxW="1080px" mx="auto" gap={6} align="stretch">
        <ShadowExtraction
          candidate={current}
          onExtract={(s) => {
            inventory.add(s);
            setTimeout(() => setIdx((i) => i + 1), 1600);
          }}
          onSkip={() => setIdx((i) => i + 1)}
        />
        <ShadowCollection shadows={inventory.shadows} />
      </VStack>
    </Box>
  );
}
