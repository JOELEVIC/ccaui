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

/**
 * A deep wooden "knock" — like a pool-ball tock or a piece set down on a board.
 * A pitch-swept triangle body (through a lowpass, for warmth) gives the low "thock";
 * a tiny filtered-noise burst adds the impact "tac" of contact.
 */
function knock(opts: { freq: number; drop: number; dur: number; gain: number; click: number }) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const t0 = ctx.currentTime;

  // Body: low triangle that drops in pitch fast, softened by a lowpass so it stays woody, not buzzy.
  const o = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(opts.freq, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(45, opts.freq - opts.drop), t0 + opts.dur);
  lp.type = "lowpass";
  lp.frequency.value = 950;
  o.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(opts.gain, t0 + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + opts.dur);
  o.start(t0);
  o.stop(t0 + opts.dur + 0.02);

  // Impact transient: a short, fading noise burst band-passed in the low-mids (warm contact "tac").
  if (opts.click > 0) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * 0.02));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const noise = ctx.createBufferSource();
    const bp = ctx.createBiquadFilter();
    const ng = ctx.createGain();
    noise.buffer = buf;
    bp.type = "bandpass";
    bp.frequency.value = 1700;
    bp.Q.value = 0.7;
    ng.gain.value = opts.click;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(ctx.destination);
    noise.start(t0);
    noise.stop(t0 + 0.03);
  }
}

/** Non-capture move: a soft, deep wooden tap. */
export function playMoveSound() {
  knock({ freq: 175, drop: 70, dur: 0.1, gain: 0.16, click: 0.05 });
}

/** Capture: a harder, deeper collision. */
export function playCaptureSound() {
  knock({ freq: 135, drop: 60, dur: 0.16, gain: 0.22, click: 0.1 });
}
