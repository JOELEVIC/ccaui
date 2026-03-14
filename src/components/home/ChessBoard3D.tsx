"use client";

import { Suspense, useRef, useState, useCallback } from "react";
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
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current || !isAnimating || !targetPos) return;
    ref.current.position.lerp(
      new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]),
      delta * 4
    );
  });

  const [x, y, z] = position;
  const s = type === "k" ? 0.5 : type === "q" ? 0.46 : type === "r" || type === "b" ? 0.44 : type === "n" ? 0.4 : 0.36;
  const mat = <meshStandardMaterial color={color} />;

  // Staunton-style procedural pieces
  const pieceContent = (() => {
    switch (type) {
      case "p":
        return (
          <>
            <mesh castShadow position={[0, 0.12 * s, 0]}>
              <cylinderGeometry args={[0.22 * s, 0.28 * s, 0.2 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.08 * s, 0]}>
              <cylinderGeometry args={[0.1 * s, 0.14 * s, 0.08 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.22 * s, 0]}>
              <sphereGeometry args={[0.14 * s, 16, 12]} />
              {mat}
            </mesh>
          </>
        );
      case "r":
        return (
          <>
            <mesh castShadow position={[0, 0.2 * s, 0]}>
              <cylinderGeometry args={[0.32 * s, 0.35 * s, 0.28 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.35 * s, 0]}>
              <cylinderGeometry args={[0.3 * s, 0.32 * s, 0.06 * s, 16]} />
              {mat}
            </mesh>
            {[0, 1, 2, 3].map((i) => (
              <mesh
                key={i}
                castShadow
                position={[
                  Math.cos((i / 4) * Math.PI * 2 + Math.PI / 4) * 0.22 * s,
                  0.42 * s,
                  Math.sin((i / 4) * Math.PI * 2 + Math.PI / 4) * 0.22 * s,
                ]}
              >
                <cylinderGeometry args={[0.07 * s, 0.09 * s, 0.1 * s, 8]} />
                {mat}
              </mesh>
            ))}
          </>
        );
      case "n":
        return (
          <>
            <mesh castShadow position={[0, 0.15 * s, 0]}>
              <cylinderGeometry args={[0.18 * s, 0.28 * s, 0.2 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.28 * s, 0]} rotation={[0.2, 0, 0]}>
              <coneGeometry args={[0.16 * s, 0.16 * s, 8]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.38 * s, 0.04 * s]}>
              <sphereGeometry args={[0.12 * s, 12, 8]} />
              {mat}
            </mesh>
          </>
        );
      case "b":
        return (
          <>
            <mesh castShadow position={[0, 0.18 * s, 0]}>
              <cylinderGeometry args={[0.14 * s, 0.3 * s, 0.24 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.32 * s, 0]}>
              <cylinderGeometry args={[0.05 * s, 0.09 * s, 0.06 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.38 * s, 0]}>
              <sphereGeometry args={[0.07 * s, 12, 8]} />
              {mat}
            </mesh>
          </>
        );
      case "q":
        return (
          <>
            <mesh castShadow position={[0, 0.18 * s, 0]}>
              <cylinderGeometry args={[0.25 * s, 0.3 * s, 0.22 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.32 * s, 0]}>
              <cylinderGeometry args={[0.12 * s, 0.18 * s, 0.06 * s, 16]} />
              {mat}
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} castShadow position={[0, (0.38 + i * 0.04) * s, 0]}>
                <sphereGeometry args={[0.1 * s * (1 - i * 0.15), 12, 8]} />
                {mat}
              </mesh>
            ))}
          </>
        );
      case "k":
        return (
          <>
            <mesh castShadow position={[0, 0.18 * s, 0]}>
              <cylinderGeometry args={[0.23 * s, 0.28 * s, 0.2 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.3 * s, 0]}>
              <cylinderGeometry args={[0.09 * s, 0.12 * s, 0.05 * s, 16]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.38 * s, 0]}>
              <cylinderGeometry args={[0.05 * s, 0.07 * s, 0.08 * s, 8]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.42 * s, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025 * s, 0.025 * s, 0.2 * s, 8]} />
              {mat}
            </mesh>
            <mesh castShadow position={[0, 0.46 * s, 0]}>
              <sphereGeometry args={[0.08 * s, 12, 8]} />
              {mat}
            </mesh>
          </>
        );
      default:
        return (
          <mesh castShadow>
            <cylinderGeometry args={[0.2 * s, 0.22 * s, 0.3 * s, 16]} />
            {mat}
          </mesh>
        );
    }
  })();

  return (
    <group ref={ref} position={[x, y, z]}>
      {pieceContent}
    </group>
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

  // No auto-rotation - board stays stable for playability

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
          0.1,
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
                0.1,
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
      <Suspense fallback={null}>
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
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minPolarAngle={Math.PI * 0.35}
            maxPolarAngle={Math.PI * 0.55}
            minAzimuthAngle={-Math.PI * 0.055}
            maxAzimuthAngle={Math.PI * 0.055}
          />
        </Canvas>
      </Suspense>
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
