"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Chess, type Square } from "chess.js";
import { Box, Text } from "@chakra-ui/react";
import { useStockfish } from "@/lib/useStockfish";
import { toaster } from "@/lib/toaster";

const FAMOUS_FENS = [
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 4",
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
  "r2qkb1r/pp2pppp/2np1n2/2bN4/2B1P3/3P4/PPP2PPP/RNBQK2R w KQkq - 0 6",
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 0 6",
  "r1bq1rk1/pppnppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 0 7",
  "r1bqk2r/pp1p1ppp/2n1pn2/2b5/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6",
  "r1bqkb1r/pp3ppp/2n1pn2/3p4/2BP4/4PN2/PPP2PPP/RNBQK2R w KQkq d6 0 5",
];

const LIGHT = "#C9A96E";
const DARK = "#1A1E26";
const PIECE_LIGHT = "#EAEAEA";
const PIECE_DARK = "#2a2420";

function Square({
  position,
  color,
  onClick,
}: {
  position: [number, number, number];
  color: string;
  onClick: () => void;
}) {
  return (
    <mesh position={position} onClick={onClick} receiveShadow>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Piece({
  type,
  color,
  position,
  isAnimating,
  targetPos,
}: {
  type: string;
  color: string;
  position: [number, number, number];
  isAnimating?: boolean;
  targetPos?: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geom = type === "p" || type === "k" ? "cylinder" : "box";

  useFrame((_, delta) => {
    if (!ref.current || !isAnimating || !targetPos) return;
    ref.current.position.lerp(
      new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]),
      delta * 4
    );
  });

  const [x, y, z] = position;
  const scale: [number, number, number] =
    type === "k"
      ? [0.5, 0.6, 0.5]
      : type === "q"
        ? [0.45, 0.55, 0.45]
        : type === "r" || type === "b"
          ? [0.4, 0.5, 0.4]
          : type === "n"
            ? [0.35, 0.45, 0.35]
            : [0.3, 0.4, 0.3];

  return (
    <mesh ref={ref} position={[x, y, z]} castShadow>
      {geom === "cylinder" ? (
        <cylinderGeometry args={[scale[0], scale[0] * 1.1, scale[1], 16]} />
      ) : (
        <boxGeometry args={scale} />
      )}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function BoardScene({
  fen,
  onSquareClick,
  animatingMove,
}: {
  fen: string;
  onSquareClick: (sq: string) => void;
  animatingMove: { from: string; to: string } | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const chess = new Chess(fen);
  const board = chess.board();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const fileToX = (f: number) => f - 3.5;
  const rankToZ = (r: number) => r - 3.5;

  const squares: JSX.Element[] = [];
  const pieces: JSX.Element[] = [];

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const isLight = (r + f) % 2 === 0;
      const sq = String.fromCharCode(97 + f) + (8 - r);
      squares.push(
        <Square
          key={sq}
          position={[fileToX(f), 0, rankToZ(r)]}
          color={isLight ? LIGHT : DARK}
          onClick={() => onSquareClick(sq)}
        />
      );
      const piece = board[r][f];
      if (piece) {
        const pos: [number, number, number] = [
          fileToX(f),
          0.15,
          rankToZ(r),
        ];
        const isAnim =
          animatingMove &&
          sq === animatingMove.from;
        const toSq = animatingMove?.to;
        const targetPos: [number, number, number] | undefined =
          isAnim && toSq
            ? [
                fileToX(toSq.charCodeAt(0) - 97),
                0.15,
                rankToZ(8 - parseInt(toSq[1], 10)),
              ]
            : undefined;
        pieces.push(
          <Piece
            key={`${r}-${f}-${piece.type}`}
            type={piece.type}
            color={piece.color === "w" ? PIECE_LIGHT : PIECE_DARK}
            position={pos}
            isAnimating={!!isAnim}
            targetPos={targetPos}
          />
        );
      }
    }
  }

  return (
    <group ref={groupRef}>
      {squares}
      {pieces}
    </group>
  );
}

export function ChessBoard3D() {
  const [fen, setFen] = useState(
    () => FAMOUS_FENS[Math.floor(Math.random() * FAMOUS_FENS.length)]
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [animatingMove, setAnimatingMove] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const { getBestMove } = useStockfish(2000);

  const turn = fen.split(" ")[1] === "w" ? "white" : "black";

  const handleSquareClick = useCallback(
    (sq: string) => {
      const c = new Chess(fen);
      if (c.isGameOver()) return;

      if (!selected) {
        const piece = c.get(sq as Square);
        if (piece && piece.color === (turn === "white" ? "w" : "b")) {
          setSelected(sq);
        }
      } else {
        if (selected === sq) {
          setSelected(null);
          return;
        }
        const moves = c.moves({ square: selected as Square, verbose: true });
        const move = moves.find((m) => m.to === sq);
        if (!move) {
          setSelected(null);
          return;
        }

        const uciMove = `${move.from}${move.to}${move.promotion || ""}`;

        getBestMove(fen).then((best) => {
          if (best && best.toLowerCase() !== uciMove.toLowerCase()) {
            setFeedback(`Best move: ${best}`);
            toaster.create({
              title: `Best move: ${best}`,
              type: "warning",
            });
            const from = best.slice(0, 2);
            const to = best.slice(2, 4);
            setAnimatingMove({ from, to });
            setTimeout(() => {
              const c = new Chess(fen);
              c.move({ from: from as Square, to: to as Square });
              setFen(c.fen());
              setAnimatingMove(null);
              setFeedback(null);
            }, 800);
          } else {
            setFeedback("Good move!");
            toaster.create({ title: "Good move!", type: "success" });
            const c2 = new Chess(fen);
            c2.move(move);
            setFen(c2.fen());
          }
          setSelected(null);
        });
      }
    },
    [selected, fen, turn, getBestMove]
  );

  return (
    <Box h="100vh" w="full" position="relative" bg="bgDark">
      <Canvas
        camera={{ position: [8, 6, 8], fov: 45 }}
        shadows
        gl={{ alpha: false, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <BoardScene
          fen={fen}
          onSquareClick={handleSquareClick}
          animatingMove={animatingMove}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={6}
          maxDistance={20}
        />
      </Canvas>
      <Box
        position="absolute"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        px={4}
        py={2}
        borderRadius="soft"
        bg="blackAlpha.6"
        borderWidth="1px"
        borderColor="whiteAlpha.06"
      >
        <Text color="textMuted" fontSize="sm">
          {feedback || `${turn === "white" ? "White" : "Black"} to play`}
        </Text>
      </Box>
    </Box>
  );
}
