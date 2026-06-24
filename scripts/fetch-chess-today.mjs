#!/usr/bin/env node
/**
 * fetch-chess-today.mjs
 *
 * Builds the "Chess Today" feed for the landing from Lichess's free, open
 * broadcast API (no key required) — real live & upcoming elite tournaments.
 *
 *   1. Fetches the top broadcasts (NDJSON).
 *   2. Sorts them into live → upcoming → recent and keeps the best handful.
 *   3. DOWNLOADS each event's thumbnail locally (public/chess-today/) so the
 *      site never hot-links an image that might vanish.
 *   4. Writes src/data/chess-today.json.
 *
 * Re-run on a schedule (or before deploy) to refresh:
 *   node scripts/fetch-chess-today.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const UA = "CCA-ChessToday/1.0 (https://cm.dchessacademy.com; educational) Node";
const ROOT = path.resolve(process.cwd());
const IMG_DIR = path.join(ROOT, "public", "chess-today");
const DATA_OUT = path.join(ROOT, "src", "data", "chess-today.json");
const KEEP = 6;
const NOW = Date.now();

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtRange(start, end) {
  if (!start) return "";
  const a = new Date(start);
  const b = end ? new Date(end) : a;
  const sameMonth = a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  const sameDay = a.toDateString() === b.toDateString();
  if (sameDay) return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} ${a.getUTCFullYear()}`;
  if (sameMonth) return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTHS[a.getUTCMonth()]} ${a.getUTCFullYear()}`;
  return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} – ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
}

function looksLikeImage(buf) {
  if (buf.length < 800) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP")
    return "webp";
  return false;
}

async function download(url, destNoExt) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const kind = looksLikeImage(buf);
  if (!kind) throw new Error("not a valid image");
  const dest = `${destNoExt}.${kind}`;
  await writeFile(dest, buf);
  return path.basename(dest);
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir(path.dirname(DATA_OUT), { recursive: true });

  const res = await fetch("https://lichess.org/api/broadcast?nb=40", {
    headers: { "User-Agent": UA, Accept: "application/x-ndjson" },
  });
  if (!res.ok) throw new Error(`broadcast API HTTP ${res.status}`);
  const text = await res.text();

  const tours = text
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l).tour;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const rank = (t) => {
    const start = t.dates?.[0] ?? 0;
    const end = t.dates?.[1] ?? start;
    if (start <= NOW && NOW <= end) return 0; // live
    if (start > NOW) return 1; // upcoming
    return 2; // recent/past
  };

  tours.sort((a, b) => {
    const ra = rank(a),
      rb = rank(b);
    if (ra !== rb) return ra - rb;
    // within a bucket: higher tier first, then nearer in time
    if ((b.tier ?? 0) !== (a.tier ?? 0)) return (b.tier ?? 0) - (a.tier ?? 0);
    return Math.abs((a.dates?.[0] ?? 0) - NOW) - Math.abs((b.dates?.[0] ?? 0) - NOW);
  });

  // One card per event — collapse the per-section duplicates (e.g. a cup's
  // many age/gender groups all share the same display title).
  const seen = new Set();
  const picked = [];
  for (const t of tours) {
    const key = t.name.split("|")[0].trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(t);
    if (picked.length >= KEEP) break;
  }
  const out = [];
  const report = [];

  for (const t of picked) {
    const start = t.dates?.[0] ?? null;
    const end = t.dates?.[1] ?? null;
    const status = rank(t) === 0 ? "live" : rank(t) === 1 ? "upcoming" : "recent";
    let image = null;
    if (t.image) {
      try {
        image = `/chess-today/${await download(t.image, path.join(IMG_DIR, t.slug))}`;
      } catch {
        image = null;
      }
    }
    const [title, subtitle] = t.name.split("|").map((s) => s.trim());
    out.push({
      id: t.id,
      title,
      subtitle: subtitle || null,
      status,
      location: t.info?.location ?? null,
      format: t.info?.format ?? null,
      dateLabel: fmtRange(start, end),
      url: t.url,
      image,
    });
    report.push(`${status.padEnd(8)} ${title}${image ? " [img]" : ""}`);
  }

  await writeFile(
    DATA_OUT,
    JSON.stringify({ updated: new Date(NOW).toISOString(), events: out }, null, 2) + "\n"
  );

  console.log("\n──────── Chess Today ────────");
  console.log(report.join("\n"));
  console.log("─────────────────────────────");
  console.log(`Wrote ${out.length} events → ${path.relative(ROOT, DATA_OUT)}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
