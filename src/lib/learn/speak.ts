/**
 * Browser text-to-speech for lesson narration. No assets, no network.
 * Picks a calm English voice when available; silently no-ops if unsupported.
 */

const LS_MUTE = "dchess-learn-muted";

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    // Muted by default — narration only plays once the user explicitly enables sound ("0").
    return localStorage.getItem(LS_MUTE) !== "0";
  } catch {
    return true;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(LS_MUTE, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (muted) cancelSpeech();
}

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices.length) return null;
  // Prefer a natural-sounding English voice.
  const prefer = ["Samantha", "Google US English", "Microsoft Aria", "Daniel", "Karen"];
  for (const name of prefer) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang?.startsWith("en")) ?? voices[0];
}

let currentAudio: HTMLAudioElement | null = null;

export function cancelSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/**
 * Stable key for a narration string — MUST match narrationKey() in
 * scripts/gen-learn-audio.mjs so the right pre-generated clip is found.
 */
export function narrationKey(text: string): string {
  const s = text.trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * Narrate `text`: play the pre-generated natural-voice clip if one exists,
 * otherwise fall back to the browser voice. Respects the mute setting.
 */
export function playNarration(text: string) {
  if (!text.trim() || isMuted()) return;
  cancelSpeech();
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    speak(text);
    return;
  }
  try {
    const audio = new Audio(`/learn-audio/${narrationKey(text)}.m4a`);
    currentAudio = audio;
    const fallback = () => {
      if (currentAudio === audio) currentAudio = null;
      speak(text);
    };
    audio.onerror = fallback;
    void audio.play().catch(fallback);
  } catch {
    speak(text);
  }
}

/** Speak `text`; cancels anything already playing. Respects the mute setting. */
export function speak(text: string) {
  if (!isSpeechSupported() || isMuted() || !text.trim()) return;
  const synth = window.speechSynthesis;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(synth);
    if (v) u.voice = v;
    u.rate = 0.98;
    u.pitch = 1;
    u.lang = v?.lang ?? "en-US";
    synth.speak(u);
  } catch {
    /* ignore */
  }
}
