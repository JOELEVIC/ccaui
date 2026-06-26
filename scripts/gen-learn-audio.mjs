#!/usr/bin/env node
/**
 * Pre-generate natural-voice narration for the Entry curriculum using Piper
 * (free, open-source neural TTS). Output: public/learn-audio/<key>.m4a, one per
 * unique say/text string. The lesson player hashes the spoken text the same way
 * (see narrationKey in src/lib/learn/speak.ts) and plays the matching file,
 * falling back to the browser voice if a file is missing.
 *
 * This is a DEV tool — run it locally to (re)generate audio when lessons change;
 * it is never part of the Vercel build. Requires: piper (pip install piper-tts)
 * and macOS `afconvert` (WAV → AAC). Re-run is idempotent (skips existing files).
 *
 *   VOICE=en_US-amy-medium node scripts/gen-learn-audio.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";

const VOICE = process.env.VOICE || "en_US-amy-medium";
const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "learn-audio");
const CURRICULUM = join(ROOT, "src", "lib", "learn", "entryCurriculum.ts");
const CACHE = join(homedir(), ".cache", "piper-voices");
const MODEL = join(CACHE, `${VOICE}.onnx`);
const PIPER = join(homedir(), "Library", "Python", "3.9", "bin", "piper");

// Keep in sync with narrationKey() in src/lib/learn/speak.ts
function narrationKey(text) {
  const s = text.trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function ensureModel() {
  if (existsSync(MODEL)) return;
  mkdirSync(CACHE, { recursive: true });
  const lang = VOICE.slice(0, 5).replace("_", "/"); // en_US -> en/en_US handled below
  const region = VOICE.split("-")[0]; // en_US
  const name = VOICE.split("-")[1]; // amy
  const quality = VOICE.split("-")[2]; // medium
  const base = `https://huggingface.co/rhasspy/piper-voices/resolve/main/${region.slice(0, 2)}/${region}/${name}/${quality}/${VOICE}`;
  console.log(`Downloading voice ${VOICE}…`);
  execFileSync("curl", ["-sL", "-o", MODEL, `${base}.onnx`]);
  execFileSync("curl", ["-sL", "-o", `${MODEL}.json`, `${base}.onnx.json`]);
}

function extractTexts() {
  const src = readFileSync(CURRICULUM, "utf8");
  const re = /(?:^|[\s{,])(?:say|text):\s*"((?:[^"\\]|\\.)*)"/g;
  const set = new Set();
  let m;
  while ((m = re.exec(src))) {
    const text = m[1].replace(/\\"/g, '"').trim();
    if (text) set.add(text);
  }
  return [...set];
}

function main() {
  ensureModel();
  mkdirSync(OUT_DIR, { recursive: true });
  const texts = extractTexts();
  const tmp = mkdtempSync(join(tmpdir(), "learn-audio-"));
  let made = 0;
  for (const text of texts) {
    const key = narrationKey(text);
    const out = join(OUT_DIR, `${key}.m4a`);
    if (existsSync(out)) continue;
    const wav = join(tmp, `${key}.wav`);
    execFileSync(PIPER, ["-m", MODEL, "-f", wav], { input: text });
    execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", wav, out]);
    made++;
    console.log(`  ✓ ${key}.m4a  «${text.slice(0, 48)}…»`);
  }
  // Manifest so the runtime/devs can see what's covered.
  writeFileSync(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify({ voice: VOICE, count: texts.length, keys: texts.map(narrationKey) }, null, 2),
  );
  console.log(`\nVoice: ${VOICE} — ${made} new clip(s), ${texts.length} total in public/learn-audio/`);
}

main();
