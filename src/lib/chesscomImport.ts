"use client";

/**
 * Lightweight Chess.com PubAPI client.
 *
 * Endpoints used:
 *   GET /pub/player/{username}/games/archives           — list of monthly archive URLs
 *   GET /pub/player/{username}/games/{YYYY}/{MM}        — games for a month
 *
 * Docs: https://www.chess.com/news/view/published-data-api
 * No auth required for public games.
 */

const PUB_BASE = "https://api.chess.com/pub";

export interface ChessComArchiveList {
  archives: string[];
}

export interface ChessComGameRaw {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  time_class: "rapid" | "blitz" | "bullet" | "daily" | string;
  rules: string;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
}

export interface ChessComMonthGames {
  games: ChessComGameRaw[];
}

export interface ImportedGame {
  source: "chess.com";
  externalUrl: string;
  pgn: string;
  timeControl: string;
  timeClass: string;
  endedAt: Date;
  rules: string;
  rated: boolean;
  white: { username: string; rating: number };
  black: { username: string; rating: number };
  /** "1-0" | "0-1" | "1/2-1/2" | "*" */
  result: string;
  /** Result from the user's perspective when `forUsername` was passed. */
  perspective?: { color: "white" | "black"; outcome: "win" | "loss" | "draw" };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("User not found on Chess.com");
    throw new Error(`Chess.com request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function fetchArchives(username: string): Promise<string[]> {
  const u = username.trim().toLowerCase();
  if (!u) throw new Error("Username required");
  const data = await fetchJson<ChessComArchiveList>(`${PUB_BASE}/player/${encodeURIComponent(u)}/games/archives`);
  return data.archives ?? [];
}

function deriveResult(white: string, black: string): string {
  if (white === "win") return "1-0";
  if (black === "win") return "0-1";
  if (
    white === "agreed" ||
    white === "stalemate" ||
    white === "repetition" ||
    white === "insufficient" ||
    white === "50move" ||
    white === "timevsinsufficient"
  ) {
    return "1/2-1/2";
  }
  return "*";
}

export function normalizeGame(raw: ChessComGameRaw, forUsername?: string): ImportedGame {
  const result = deriveResult(raw.white.result, raw.black.result);
  const game: ImportedGame = {
    source: "chess.com",
    externalUrl: raw.url,
    pgn: raw.pgn,
    timeControl: raw.time_control,
    timeClass: raw.time_class,
    endedAt: new Date(raw.end_time * 1000),
    rules: raw.rules,
    rated: raw.rated,
    white: { username: raw.white.username, rating: raw.white.rating },
    black: { username: raw.black.username, rating: raw.black.rating },
    result,
  };

  if (forUsername) {
    const target = forUsername.trim().toLowerCase();
    const isWhite = raw.white.username.toLowerCase() === target;
    const isBlack = raw.black.username.toLowerCase() === target;
    if (isWhite || isBlack) {
      const color: "white" | "black" = isWhite ? "white" : "black";
      const myResult = isWhite ? raw.white.result : raw.black.result;
      const outcome: "win" | "loss" | "draw" =
        myResult === "win" ? "win" : result === "1/2-1/2" ? "draw" : "loss";
      game.perspective = { color, outcome };
    }
  }

  return game;
}

export async function fetchLatestMonth(username: string, forUsername?: string): Promise<ImportedGame[]> {
  const archives = await fetchArchives(username);
  if (archives.length === 0) return [];
  const latest = archives[archives.length - 1];
  const data = await fetchJson<ChessComMonthGames>(latest);
  return (data.games ?? []).map((g) => normalizeGame(g, forUsername ?? username)).reverse();
}

export async function fetchMonth(
  username: string,
  year: number,
  month: number,
  forUsername?: string
): Promise<ImportedGame[]> {
  const u = username.trim().toLowerCase();
  const mm = String(month).padStart(2, "0");
  const data = await fetchJson<ChessComMonthGames>(
    `${PUB_BASE}/player/${encodeURIComponent(u)}/games/${year}/${mm}`
  );
  return (data.games ?? []).map((g) => normalizeGame(g, forUsername ?? username)).reverse();
}

import { Chess } from "chess.js";

/** Extract initial FEN (null if standard start) and UCI move list from a PGN. */
export function pgnToUci(pgn: string): { initialFen: string | null; moves: string[] } | null {
  try {
    const c = new Chess();
    c.loadPgn(pgn);
    const initialFenHeader = c.header().FEN ?? null;
    const history = c.history({ verbose: true });
    const moves = history.map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
    return { initialFen: initialFenHeader, moves };
  } catch {
    return null;
  }
}
