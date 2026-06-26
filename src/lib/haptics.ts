/**
 * Tactile feedback via the Vibration API. Works on Android (Chrome, etc.);
 * iOS Safari has no web vibration, so it's a no-op there. Keep pulses short —
 * a tap should feel like a tick, not a buzz.
 */
export function haptic(pattern: number | number[] = 8): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* unsupported / blocked — ignore */
  }
}

export const HAPTIC = {
  tap: 8,
  light: 5,
  medium: 14,
  move: 12,
  success: [10, 40, 14] as number[],
  warn: [20, 30, 20] as number[],
};
