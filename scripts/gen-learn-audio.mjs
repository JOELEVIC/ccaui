#!/usr/bin/env node
/**
 * Pre-generate natural-voice narration for the Entry curriculum using Piper
 * (free, open-source neural TTS). Output: public/learn-audio/<voice>/<key>.m4a,
 * one clip per unique say/text string, for every voice in VOICES. The lesson
 * player hashes the spoken text the same way (narrationKey in
 * src/lib/learn/speak.ts), picks the learner's chosen voice folder, and plays
 * the matching file — falling back to the browser voice if a file is missing.
 *
 * DEV tool — run locally to (re)generate audio when lessons change; never part
 * of the Vercel build. Requires: piper (pip install piper-tts) and macOS
 * `afconvert`. Idempotent (skips existing files).
 *
 *   node scripts/gen-learn-audio.mjs
 *
 * Keep VOICES in sync with LEARN_VOICES in src/lib/learn/speak.ts.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";

// id, region, name, quality
const VOICES = [
  ["en_US-ryan-high", "en_US", "ryan", "high"],
  ["en_US-amy-medium", "en_US", "amy", "medium"],
  ["en_US-lessac-medium", "en_US", "lessac", "medium"],
  ["en_GB-alba-medium", "en_GB", "alba", "medium"],
  ["en_US-hfc_female-medium", "en_US", "hfc_female", "medium"],
];

const ROOT = process.cwd();
const OUT_ROOT = join(ROOT, "public", "learn-audio");
const CURRICULUM = join(ROOT, "src", "lib", "learn", "entryCurriculum.ts");
const CACHE = join(homedir(), ".cache", "piper-voices");
const PIPER = join(homedir(), "Library", "Python", "3.9", "bin", "piper");

// Keep in sync with narrationKey() in src/lib/learn/speak.ts
function narrationKey(text) {
  const s = text.trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function ensureModel(voice, region, name, quality) {
  const model = join(CACHE, `${voice}.onnx`);
  if (existsSync(model)) return model;
  mkdirSync(CACHE, { recursive: true });
  const base = `https://huggingface.co/rhasspy/piper-voices/resolve/main/${region.slice(0, 2)}/${region}/${name}/${quality}/${voice}`;
  console.log(`Downloading voice ${voice}…`);
  execFileSync("curl", ["-sL", "-o", model, `${base}.onnx`]);
  execFileSync("curl", ["-sL", "-o", `${model}.json`, `${base}.onnx.json`]);
  return model;
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
  const texts = extractTexts();
  const tmp = mkdtempSync(join(tmpdir(), "learn-audio-"));
  for (const [voice, region, name, quality] of VOICES) {
    const model = ensureModel(voice, region, name, quality);
    const outDir = join(OUT_ROOT, voice);
    mkdirSync(outDir, { recursive: true });
    let made = 0;
    for (const text of texts) {
      const key = narrationKey(text);
      const out = join(outDir, `${key}.m4a`);
      if (existsSync(out)) continue;
      const wav = join(tmp, `${voice}-${key}.wav`);
      execFileSync(PIPER, ["-m", model, "-f", wav], { input: text });
      execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", wav, out]);
      made++;
    }
    console.log(`  ${voice}: ${made} new, ${texts.length} total`);
  }
  writeFileSync(
    join(OUT_ROOT, "manifest.json"),
    JSON.stringify({ voices: VOICES.map((v) => v[0]), count: extractTexts().length }, null, 2),
  );
  console.log(`\n${VOICES.length} voices × ${texts.length} clips in public/learn-audio/<voice>/`);
}

main();
