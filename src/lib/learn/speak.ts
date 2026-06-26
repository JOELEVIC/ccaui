/**
 * Lesson narration: plays pre-generated natural-voice clips (public/learn-audio),
 * falling back to the browser's built-in speech when a clip is missing.
 */

const LS_MUTE = "dchess-learn-muted";
const LS_VOICE = "dchess-learn-voice";

/** Pre-generated narration voices (keep in sync with VOICES in scripts/gen-learn-audio.mjs). */
export const LEARN_VOICES: { id: string; label: string }[] = [
  { id: "en_US-ryan-high", label: "Ryan · US male" },
  { id: "en_US-amy-medium", label: "Amy · US female" },
  { id: "en_US-lessac-medium", label: "Lessac · US, clear" },
  { id: "en_GB-alba-medium", label: "Alba · UK female" },
  { id: "en_US-hfc_female-medium", label: "Heather · US female" },
];
export const DEFAULT_VOICE = "en_US-ryan-high";

export function getVoice(): string {
  if (typeof window === "undefined") return DEFAULT_VOICE;
  try {
    const v = localStorage.getItem(LS_VOICE);
    return v && LEARN_VOICES.some((x) => x.id === v) ? v : DEFAULT_VOICE;
  } catch {
    return DEFAULT_VOICE;
  }
}

export function setVoice(id: string) {
  try {
    localStorage.setItem(LS_VOICE, id);
  } catch {
    /* ignore */
  }
}

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
    const audio = new Audio(`/learn-audio/${getVoice()}/${narrationKey(text)}.m4a`);
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
