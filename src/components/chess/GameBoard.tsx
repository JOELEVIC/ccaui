"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";

interface GameBoardProps {
  fen: string;
  orientation: "white" | "black";
  isMyTurn: boolean;
  onMove: (move: string) => void;
  allowMove: boolean;
}

const DARK_SQUARE = "#2a2420";
const LIGHT_SQUARE = "#3d3630";
const SELECTED_HIGHLIGHT = "rgba(198, 167, 94, 0.5)";
const LEGAL_MOVE_HIGHLIGHT = "rgba(198, 167, 94, 0.25)";

export function GameBoard({ fen, orientation, isMyTurn, onMove, allowMove }: GameBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const game = useMemo(() => {
    const c = new Chess();
    try {
      c.load(fen);
    } catch {
      // invalid fen
    }
    return c;
  }, [fen]);

  const myColor = orientation === "white" ? "w" : "b";

  const executeMove = useCallback(
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

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      const ok = executeMove(sourceSquare, targetSquare);
      if (ok) setSelectedSquare(null);
      return ok;
    },
    [executeMove]
  );

  const canDrag = useCallback(() => allowMove && isMyTurn, [allowMove, isMyTurn]);

  const legalTargets = useMemo(() => {
    if (!selectedSquare || !allowMove || !isMyTurn) return new Set<string>();
    const moves = game.moves({ square: selectedSquare as Square, verbose: true });
    return new Set(moves.map((m) => m.to));
  }, [game, selectedSquare, allowMove, isMyTurn]);

  const isMyPieceType = useCallback(
    (pieceType: string) => {
      const isWhite = pieceType !== pieceType.toLowerCase();
      return myColor === "w" ? isWhite : !isWhite;
    },
    [myColor]
  );

  const handleSquareClick = useCallback(
    ({ square, piece }: { square: string; piece: { pieceType: string } | null }) => {
      if (!allowMove || !isMyTurn) return;
      if (selectedSquare) {
        if (legalTargets.has(square)) {
          executeMove(selectedSquare, square);
          setSelectedSquare(null);
        } else if (piece && isMyPieceType(piece.pieceType)) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      } else {
        if (piece && isMyPieceType(piece.pieceType)) {
          setSelectedSquare(square);
        }
      }
    },
    [allowMove, isMyTurn, selectedSquare, legalTargets, isMyPieceType, executeMove]
  );

  // Clear selection when position changes (e.g. after opponent move)
  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: SELECTED_HIGHLIGHT };
      legalTargets.forEach((sq) => {
        styles[sq] = { backgroundColor: LEGAL_MOVE_HIGHLIGHT };
      });
    }
    return styles;
  }, [selectedSquare, legalTargets]);

  return (
    <Box>
      <div style={{ maxWidth: "min(90vmin, 720px)", margin: "0 auto" }}>
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging: allowMove && isMyTurn,
            onPieceDrop: ({ sourceSquare, targetSquare }) => (targetSquare ? onDrop(sourceSquare, targetSquare) : false),
            canDragPiece: canDrag,
            onSquareClick: handleSquareClick,
            squareStyles,
            dropSquareStyle: { backgroundColor: LEGAL_MOVE_HIGHLIGHT },
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
