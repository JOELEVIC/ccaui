/**
 * CCA Game Play API client.
 * Uses chessliveapi (cca) for: startGameSession, makeMove, resign, draw, and gameUpdated subscription.
 * Game record (create, list, fetch) stays on main GraphQL (ccanext).
 */

const GAME_API_URI =
  process.env.NEXT_PUBLIC_GAME_API_URI ?? "https://chessliveapi.blacksilvergroups.xyz/graphql";

/** Subscription URL: same host as GAME_API_URI, path /subscriptions, wss if https */
export function getGameWsUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const u = new URL(GAME_API_URI);
    const protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${u.host}/subscriptions`;
  } catch {
    return "";
  }
}

export function getGameApiUrl(): string {
  return GAME_API_URI;
}

export interface GameSession {
  gameId: string;
  whiteId: string;
  blackId: string;
  moves: string;
  status: string;
  result?: string | null;
  timeControl: string;
  drawOfferBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameUpdatePayload {
  gameId: string;
  event: string;
  moves: string;
  status: string;
  result?: string | null;
  drawOfferBy?: string | null;
  move?: string;
  reason?: string;
}

const START_SESSION = `mutation StartGameSession($gameId: ID!, $whiteId: ID!, $blackId: ID!, $timeControl: String!) {
  startGameSession(gameId: $gameId, whiteId: $whiteId, blackId: $blackId, timeControl: $timeControl) {
    gameId moves status result timeControl drawOfferBy
  }
}`;

const MAKE_MOVE = `mutation MakeMove($gameId: ID!, $move: String!) {
  makeMove(gameId: $gameId, move: $move) { gameId moves status result }
}`;

const RESIGN_GAME = `mutation ResignGame($gameId: ID!) {
  resignGame(gameId: $gameId) { gameId status result }
}`;

const OFFER_DRAW = `mutation OfferDraw($gameId: ID!) {
  offerDraw(gameId: $gameId) { gameId drawOfferBy }
}`;

const ACCEPT_DRAW = `mutation AcceptDraw($gameId: ID!) {
  acceptDraw(gameId: $gameId) { gameId status result }
}`;

const REJECT_DRAW = `mutation RejectDraw($gameId: ID!) {
  rejectDraw(gameId: $gameId) { gameId drawOfferBy }
}`;

export type CcaGameMutation =
  | { name: "startGameSession"; variables: { gameId: string; whiteId: string; blackId: string; timeControl: string } }
  | { name: "makeMove"; variables: { gameId: string; move: string } }
  | { name: "resignGame"; variables: { gameId: string } }
  | { name: "offerDraw"; variables: { gameId: string } }
  | { name: "acceptDraw"; variables: { gameId: string } }
  | { name: "rejectDraw"; variables: { gameId: string } };

async function ccaRequest<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(GAME_API_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "GraphQL error");
  }
  if (!json.data) throw new Error("No data");
  return json.data as T;
}

export async function startGameSession(
  token: string,
  gameId: string,
  whiteId: string,
  blackId: string,
  timeControl: string
): Promise<GameSession> {
  const data = await ccaRequest<{ startGameSession: GameSession }>(token, START_SESSION, {
    gameId,
    whiteId,
    blackId,
    timeControl,
  });
  return data.startGameSession;
}

export async function makeMove(token: string, gameId: string, move: string): Promise<GameSession> {
  const data = await ccaRequest<{ makeMove: GameSession }>(token, MAKE_MOVE, { gameId, move });
  return data.makeMove;
}

export async function resignGame(token: string, gameId: string): Promise<GameSession> {
  const data = await ccaRequest<{ resignGame: GameSession }>(token, RESIGN_GAME, { gameId });
  return data.resignGame;
}

export async function offerDraw(token: string, gameId: string): Promise<GameSession> {
  const data = await ccaRequest<{ offerDraw: GameSession }>(token, OFFER_DRAW, { gameId });
  return data.offerDraw;
}

export async function acceptDraw(token: string, gameId: string): Promise<GameSession> {
  const data = await ccaRequest<{ acceptDraw: GameSession }>(token, ACCEPT_DRAW, { gameId });
  return data.acceptDraw;
}

export async function rejectDraw(token: string, gameId: string): Promise<GameSession> {
  const data = await ccaRequest<{ rejectDraw: GameSession }>(token, REJECT_DRAW, { gameId });
  return data.rejectDraw;
}
