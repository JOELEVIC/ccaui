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
  /** Highlight last move (gold) — squares in algebraic notation */
  lastMove?: { from: string; to: string } | null;
}

const DARK_SQUARE = "#9ca3af";
const LIGHT_SQUARE = "#e5e7eb";
const SELECTED_HIGHLIGHT = "rgba(230, 164, 82, 0.45)";
const LEGAL_MOVE_HIGHLIGHT = "rgba(230, 164, 82, 0.22)";
const LAST_MOVE_HIGHLIGHT = "rgba(230, 164, 82, 0.55)";

export function GameBoard({ fen, orientation, isMyTurn, onMove, allowMove, lastMove }: GameBoardProps) {
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
    if (lastMove?.from) styles[lastMove.from] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
    if (lastMove?.to) styles[lastMove.to] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: SELECTED_HIGHLIGHT };
      legalTargets.forEach((sq) => {
        if (!styles[sq]) styles[sq] = { backgroundColor: LEGAL_MOVE_HIGHLIGHT };
      });
    }
    return styles;
  }, [selectedSquare, legalTargets, lastMove]);

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
            boardStyle: { borderRadius: 12, boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" },
            darkSquareNotationStyle: { fill: "#4b5563", fontSize: 11 },
            lightSquareNotationStyle: { fill: "#6b7280", fontSize: 11 },
            alphaNotationStyle: { fill: "#6b7280", fontSize: 11 },
            numericNotationStyle: { fill: "#6b7280", fontSize: 11 },
          }}
        />
      </div>
    </Box>
  );
}
