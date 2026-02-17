export type GameWsMessage =
  | { type: "GAME_STATE"; data: GameStatePayload }
  | { type: "MOVE"; data: MovePayload }
  | { type: "GAME_END"; data: GameEndPayload }
  | { type: "DRAW_OFFER"; data: { gameId: string; userId: string } }
  | { type: "DRAW_REJECTED"; data: { gameId: string; userId: string } }
  | { type: "ERROR"; message: string };

export interface GameStatePayload {
  gameId: string;
  whiteId: string;
  blackId: string;
  moves: string;
  status: string;
  result?: string;
  timeControl: string;
}

export interface MovePayload {
  gameId: string;
  move: string;
  moves: string;
  status: string;
}

export interface GameEndPayload {
  gameId: string;
  status: string;
  result?: string;
  reason?: string;
}

export type ClientMessage =
  | { type: "MOVE"; gameId: string; userId: string; move: string; timestamp: number }
  | { type: "RESIGN"; gameId: string; userId: string; timestamp: number }
  | { type: "OFFER_DRAW"; gameId: string; userId: string; timestamp: number }
  | { type: "ACCEPT_DRAW"; gameId: string; userId: string; timestamp: number }
  | { type: "REJECT_DRAW"; gameId: string; userId: string; timestamp: number }
  | { type: "LEAVE"; gameId: string; userId: string; timestamp: number };

const WS_BASE = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000") : "";

export function getGameWsUrl(gameId: string, token?: string): string {
  const base = `${WS_BASE}/ws/game/${gameId}`;
  if (token) return `${base}?token=${encodeURIComponent(token)}`;
  return base;
}

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private gameId: string;
  private userId: string;
  private token: string;
  private onMessage: (msg: GameWsMessage) => void;
  private reconnectAttempts = 0;
  private maxReconnect = 5;
  private reconnectDelay = 1000;

  constructor(
    gameId: string,
    userId: string,
    token: string,
    onMessage: (msg: GameWsMessage) => void
  ) {
    this.gameId = gameId;
    this.userId = userId;
    this.token = token;
    this.onMessage = onMessage;
  }

  connect(): void {
    const url = getGameWsUrl(this.gameId, this.token);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as GameWsMessage;
        this.onMessage(msg);
      } catch {
        this.onMessage({ type: "ERROR", message: "Invalid message" });
      }
    };

    this.ws.onerror = () => {
      this.onMessage({ type: "ERROR", message: "Connection error" });
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnect) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
      }
    };
  }

  send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  sendMove(move: string): void {
    this.send({
      type: "MOVE",
      gameId: this.gameId,
      userId: this.userId,
      move,
      timestamp: Date.now(),
    });
  }

  resign(): void {
    this.send({
      type: "RESIGN",
      gameId: this.gameId,
      userId: this.userId,
      timestamp: Date.now(),
    });
  }

  offerDraw(): void {
    this.send({
      type: "OFFER_DRAW",
      gameId: this.gameId,
      userId: this.userId,
      timestamp: Date.now(),
    });
  }

  acceptDraw(): void {
    this.send({
      type: "ACCEPT_DRAW",
      gameId: this.gameId,
      userId: this.userId,
      timestamp: Date.now(),
    });
  }

  rejectDraw(): void {
    this.send({
      type: "REJECT_DRAW",
      gameId: this.gameId,
      userId: this.userId,
      timestamp: Date.now(),
    });
  }

  disconnect(): void {
    this.send({
      type: "LEAVE",
      gameId: this.gameId,
      userId: this.userId,
      timestamp: Date.now(),
    });
    this.ws?.close();
    this.ws = null;
  }
}
