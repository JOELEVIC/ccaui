/**
 * Lightweight move/capture feedback via Web Audio API (no asset files).
 * Safe to call from client only; no-ops if AudioContext unavailable.
 */

function materialCount(fen: string): number {
  const board = fen.split(/\s+/)[0] ?? "";
  let n = 0;
  for (const ch of board) {
    if (/[pnbrqkPNBRQK]/.test(ch)) n += 1;
  }
  return n;
}

export function isCaptureByFenChange(prevFen: string, nextFen: string): boolean {
  return materialCount(nextFen) < materialCount(prevFen);
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
  } catch {
    return null;
  }
}

function beep(freq: number, duration: number, gainVal: number) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  o.connect(g);
  g.connect(ctx.destination);
  const t0 = ctx.currentTime;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gainVal, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  o.start(t0);
  o.stop(t0 + duration + 0.02);
}

/** Non-capture move: short higher click */
export function playMoveSound() {
  beep(520, 0.06, 0.12);
}

/** Capture: lower brief thud */
export function playCaptureSound() {
  beep(220, 0.1, 0.16);
  setTimeout(() => beep(165, 0.08, 0.08), 35);
}
