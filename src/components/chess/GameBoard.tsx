"use client";

import { useCallback, useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

interface GameBoardProps {
  fen: string;
  orientation: "white" | "black";
  isMyTurn: boolean;
  onMove: (move: string) => void;
  allowMove: boolean;
}

const DARK_SQUARE = "#2a2420";
const LIGHT_SQUARE = "#3d3630";

export function GameBoard({ fen, orientation, isMyTurn, onMove, allowMove }: GameBoardProps) {
  const game = useMemo(() => {
    const c = new Chess();
    try {
      c.load(fen);
    } catch {
      // invalid fen
    }
    return c;
  }, [fen]);

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!allowMove) return false;
      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        if (move) {
          const san = `${move.from}${move.to}`;
          if (move.promotion) {
            onMove(san + move.promotion.toLowerCase());
          } else {
            onMove(san);
          }
          return true;
        }
      } catch {
        // invalid move
      }
      return false;
    },
    [game, allowMove, onMove]
  );

  const canDrag = useCallback(() => allowMove && isMyTurn, [allowMove, isMyTurn]);

  return (
    <Box>
      <div style={{ maxWidth: "min(90vmin, 560px)", margin: "0 auto" }}>
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging: allowMove && isMyTurn,
            onPieceDrop: ({ sourceSquare, targetSquare }) => (targetSquare ? onDrop(sourceSquare, targetSquare) : false),
            canDragPiece: canDrag,
            showNotation: true,
            darkSquareStyle: { backgroundColor: DARK_SQUARE },
            lightSquareStyle: { backgroundColor: LIGHT_SQUARE },
            boardStyle: { borderRadius: 6, boxShadow: "0 0 0 1px rgba(143, 121, 61, 0.3)" },
            darkSquareNotationStyle: { fill: "#8f793d", fontSize: 11 },
            lightSquareNotationStyle: { fill: "#8f793d", fontSize: 11 },
            alphaNotationStyle: { fill: "#8f793d", fontSize: 11 },
            numericNotationStyle: { fill: "#8f793d", fontSize: 11 },
          }}
        />
      </div>
    </Box>
  );
}
