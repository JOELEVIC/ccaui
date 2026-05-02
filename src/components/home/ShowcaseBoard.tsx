"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const DEMOS: { name: string; sans: string[] }[] = [
  {
    name: "Italian Game · Evans Gambit",
    sans: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", "d4"],
  },
  {
    name: "Sicilian · Najdorf",
    sans: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5"],
  },
  {
    name: "Queen's Gambit Declined",
    sans: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3"],
  },
];

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const MOVE_INTERVAL_MS = 1100;
const PAUSE_AFTER_LINE_MS = 1800;
const RESET_PAUSE_MS = 600;

interface ShowcaseBoardProps {
  /** Side length in CSS units (e.g. "100%", "420px"). Defaults to 100%. */
  size?: string;
  /** When true the board does not auto-play. */
  paused?: boolean;
  /** Optional callback fired with the current opening line name. */
  onLineChange?: (name: string) => void;
  /** Override the demos with a custom list. */
  demos?: { name: string; sans: string[] }[];
  /** Light/dark square colours — defaults match the platform palette. */
  lightSquare?: string;
  darkSquare?: string;
  /** Glow ring around the board. */
  glow?: string;
}

export function ShowcaseBoard({
  size = "100%",
  paused = false,
  onLineChange,
  demos = DEMOS,
  lightSquare = "#e9d8a3",
  darkSquare = "#3a2f24",
  glow = "rgba(230,164,82,0.25)",
}: ShowcaseBoardProps) {
  const [demoIndex, setDemoIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const demo = demos[demoIndex];

  const fen = useMemo(() => {
    const chess = new Chess(START_FEN);
    for (let i = 0; i < moveIndex; i++) {
      try {
        chess.move(demo.sans[i]);
      } catch {
        break;
      }
    }
    return chess.fen();
  }, [demo, moveIndex]);

  useEffect(() => {
    onLineChange?.(demo.name);
  }, [demo, onLineChange]);

  useEffect(() => {
    if (paused) return;
    const advance = () => {
      if (moveIndex < demo.sans.length) {
        setMoveIndex((m) => m + 1);
      } else {
        // After finishing a line, pause, reset, then move to next demo.
        timerRef.current = setTimeout(() => {
          setMoveIndex(0);
          timerRef.current = setTimeout(() => {
            setDemoIndex((d) => (d + 1) % demos.length);
          }, RESET_PAUSE_MS);
        }, PAUSE_AFTER_LINE_MS);
        return;
      }
    };
    timerRef.current = setTimeout(advance, MOVE_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, moveIndex, demo, demos.length]);

  return (
    <Box
      position="relative"
      w={size}
      maxW="100%"
      aspectRatio="1 / 1"
    >
      <Box
        position="absolute"
        inset="-8%"
        borderRadius="full"
        background={`radial-gradient(circle at 50% 50%, ${glow} 0%, transparent 65%)`}
        pointerEvents="none"
        filter="blur(28px)"
        opacity={0.9}
      />
      <Box
        position="relative"
        w="full"
        h="full"
        borderRadius="14px"
        boxShadow="0 24px 80px rgba(0,0,0,0.55)"
        overflow="hidden"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
      >
        <Chessboard
          options={{
            position: fen,
            boardOrientation: "white",
            allowDragging: false,
            showNotation: false,
            darkSquareStyle: { backgroundColor: darkSquare },
            lightSquareStyle: { backgroundColor: lightSquare },
            boardStyle: { borderRadius: 14 },
            animationDurationInMs: 380,
          }}
        />
      </Box>
    </Box>
  );
}
