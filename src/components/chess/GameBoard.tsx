"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { Chessboard } from "react-chessboard";
import type { Arrow } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { findPremoveMove, legalMovesIfSideToMove } from "@/lib/chessPremoves";

export interface PendingPremove {
  from: string;
  to: string;
  promotion?: string;
}

interface GameBoardProps {
  fen: string;
  orientation: "white" | "black";
  /** True when it is this player's turn to move in the game. */
  isMyTurn: boolean;
  /** True when a move request is in flight (blocks input). */
  movePending?: boolean;
  onMove: (move: string) => void;
  allowMove: boolean;
  /** Highlight last move (gold) — squares in algebraic notation */
  lastMove?: { from: string; to: string } | null;
  premoveEnabled?: boolean;
  pendingPremove?: PendingPremove | null;
  onPendingPremove?: (p: PendingPremove) => void;
  /** Drawn on top of last-move / selection highlights (e.g. review mode). */
  extraSquareStyles?: Record<string, React.CSSProperties>;
  /** Engine / review arrows (from → to). */
  reviewArrows?: Arrow[];
}

const DARK_SQUARE = "#9ca3af";
const LIGHT_SQUARE = "#e5e7eb";
const SELECTED_HIGHLIGHT = "rgba(230, 164, 82, 0.45)";
const LEGAL_MOVE_HIGHLIGHT = "rgba(230, 164, 82, 0.22)";
const LAST_MOVE_HIGHLIGHT = "rgba(230, 164, 82, 0.55)";
const PREMOVE_HIGHLIGHT = "rgba(168, 85, 247, 0.42)";
const PREMOVE_LEGAL_HIGHLIGHT = "rgba(168, 85, 247, 0.2)";

export function GameBoard({
  fen,
  orientation,
  isMyTurn,
  movePending = false,
  onMove,
  allowMove,
  lastMove,
  premoveEnabled = false,
  pendingPremove = null,
  onPendingPremove,
  extraSquareStyles,
  reviewArrows,
}: GameBoardProps) {
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
  const canPlayNow = allowMove && isMyTurn && !movePending;
  const premoveActive = !!(allowMove && premoveEnabled && onPendingPremove && !isMyTurn && !movePending);

  const executeMove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!canPlayNow) return false;
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
    [game, canPlayNow, onMove]
  );

  const executePremove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!premoveActive || !onPendingPremove) return false;
      const m = findPremoveMove(fen, myColor, sourceSquare as Square, targetSquare as Square);
      if (!m) return false;
      onPendingPremove({
        from: m.from,
        to: m.to,
        promotion: m.promotion ? m.promotion.toLowerCase() : undefined,
      });
      return true;
    },
    [premoveActive, onPendingPremove, fen, myColor]
  );

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (canPlayNow) {
        const ok = executeMove(sourceSquare, targetSquare);
        if (ok) setSelectedSquare(null);
        return ok;
      }
      if (premoveActive) {
        const ok = executePremove(sourceSquare, targetSquare);
        if (ok) setSelectedSquare(null);
        return ok;
      }
      return false;
    },
    [canPlayNow, premoveActive, executeMove, executePremove]
  );

  const canDragPiece = useCallback(
    ({
      piece,
      isSparePiece,
      square,
    }: {
      piece: { pieceType: string };
      isSparePiece: boolean;
      square: string | null;
    }) => {
      if (isSparePiece || !square) return false;
      if (!allowMove || movePending) return false;
      const isWhite = piece.pieceType !== piece.pieceType.toLowerCase();
      const mine = myColor === "w" ? isWhite : !isWhite;
      if (!mine) return false;
      if (canPlayNow) return true;
      if (premoveActive) return true;
      return false;
    },
    [allowMove, movePending, myColor, canPlayNow, premoveActive]
  );

  const legalTargets = useMemo(() => {
    if (!selectedSquare || !canPlayNow) return new Set<string>();
    const moves = game.moves({ square: selectedSquare as Square, verbose: true });
    return new Set(moves.map((m) => m.to));
  }, [game, selectedSquare, canPlayNow]);

  const premoveLegalTargets = useMemo(() => {
    if (!selectedSquare || !premoveActive) return new Set<string>();
    const moves = legalMovesIfSideToMove(fen, myColor).filter((m) => m.from === selectedSquare);
    return new Set(moves.map((m) => m.to));
  }, [fen, myColor, selectedSquare, premoveActive]);

  const isMyPieceType = useCallback(
    (pieceType: string) => {
      const isWhite = pieceType !== pieceType.toLowerCase();
      return myColor === "w" ? isWhite : !isWhite;
    },
    [myColor]
  );

  const handleSquareClick = useCallback(
    ({ square, piece }: { square: string; piece: { pieceType: string } | null }) => {
      if (movePending || !allowMove) return;

      if (canPlayNow) {
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
        return;
      }

      if (premoveActive && onPendingPremove) {
        if (selectedSquare) {
          if (premoveLegalTargets.has(square)) {
            const m = findPremoveMove(fen, myColor, selectedSquare as Square, square as Square);
            if (m) {
              onPendingPremove({
                from: m.from,
                to: m.to,
                promotion: m.promotion ? m.promotion.toLowerCase() : undefined,
              });
            }
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
      }
    },
    [
      movePending,
      allowMove,
      canPlayNow,
      premoveActive,
      onPendingPremove,
      selectedSquare,
      legalTargets,
      premoveLegalTargets,
      isMyPieceType,
      executeMove,
      fen,
      myColor,
    ]
  );

  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (lastMove?.from) styles[lastMove.from] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
    if (lastMove?.to) styles[lastMove.to] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
    if (pendingPremove?.from) {
      styles[pendingPremove.from] = { backgroundColor: PREMOVE_HIGHLIGHT };
    }
    if (pendingPremove?.to) {
      styles[pendingPremove.to] = {
        ...styles[pendingPremove.to],
        backgroundColor: PREMOVE_HIGHLIGHT,
      };
    }
    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor: canPlayNow ? SELECTED_HIGHLIGHT : PREMOVE_HIGHLIGHT,
      };
      const targets = canPlayNow ? legalTargets : premoveLegalTargets;
      targets.forEach((sq) => {
        if (!styles[sq]) {
          styles[sq] = {
            backgroundColor: canPlayNow ? LEGAL_MOVE_HIGHLIGHT : PREMOVE_LEGAL_HIGHLIGHT,
          };
        }
      });
    }
    if (extraSquareStyles) {
      for (const [sq, st] of Object.entries(extraSquareStyles)) {
        styles[sq] = { ...styles[sq], ...st };
      }
    }
    return styles;
  }, [
    selectedSquare,
    legalTargets,
    premoveLegalTargets,
    lastMove,
    pendingPremove,
    canPlayNow,
    extraSquareStyles,
  ]);

  const allowDragging = canPlayNow || premoveActive;

  return (
    <Box>
      <div style={{ maxWidth: "min(90vmin, 720px)", margin: "0 auto" }}>
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging,
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              targetSquare ? onDrop(sourceSquare, targetSquare) : false,
            canDragPiece,
            onSquareClick: handleSquareClick,
            squareStyles,
            dropSquareStyle: {
              backgroundColor: canPlayNow ? LEGAL_MOVE_HIGHLIGHT : PREMOVE_LEGAL_HIGHLIGHT,
            },
            showNotation: true,
            darkSquareStyle: { backgroundColor: DARK_SQUARE },
            lightSquareStyle: { backgroundColor: LIGHT_SQUARE },
            boardStyle: { borderRadius: 12, boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" },
            darkSquareNotationStyle: { fill: "#4b5563", fontSize: 11 },
            lightSquareNotationStyle: { fill: "#6b7280", fontSize: 11 },
            alphaNotationStyle: { fill: "#6b7280", fontSize: 11 },
            numericNotationStyle: { fill: "#6b7280", fontSize: 11 },
            arrows: reviewArrows ?? [],
            clearArrowsOnPositionChange: true,
          }}
        />
      </div>
    </Box>
  );
}
