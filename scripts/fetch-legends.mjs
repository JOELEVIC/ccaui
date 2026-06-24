#!/usr/bin/env node
/**
 * fetch-legends.mjs
 *
 * Builds the Legends dataset for the landing's world-greats gallery.
 *
 * For each curated legend (scripts/legends.seed.json) it:
 *   1. Asks the English Wikipedia for the page's lead portrait + intro extract.
 *   2. Asks Wikimedia Commons for that file's licence + author (extmetadata),
 *      plus a sensibly-sized thumbnail URL.
 *   3. Rejects anything that isn't clearly free to reuse (public domain / CC).
 *   4. DOWNLOADS the actual image into public/legends/ and verifies it really
 *      is a valid JPEG/PNG (content-type + magic bytes) — so the site ships
 *      the photos, never hot-links them.
 *   5. Writes src/data/legends.json (curated facts + local image + attribution).
 *
 * Run from the ccaui/ root:  node scripts/fetch-legends.mjs
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const UA =
  "CCA-Legends/1.0 (https://cm.dchessacademy.com; Cameroon Chess Academy; educational) Node-fetch";

const ROOT = path.resolve(process.cwd());
const SEED = path.join(ROOT, "scripts", "legends.seed.json");
const IMG_DIR = path.join(ROOT, "public", "legends");
const DATA_DIR = path.join(ROOT, "src", "data");
const DATA_OUT = path.join(DATA_DIR, "legends.json");

const THUMB_WIDTH = 720; // plenty sharp for cards, keeps the repo light

// Accept only clearly-free licences. Anything matching the non-free list is
// rejected even if it also trips the free regex.
const FREE_RE = /public domain|^pd[- ]|cc0|cc[ -]?by(?:[ -]?sa)?|creative commons/i;
const NONFREE_RE = /fair use|non-?free|all rights reserved|©|\bcopyright(?!ed by the author)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function stripHtml(s) {
  return (s ?? "")
    .toString()
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lead image filename + direct URL + intro extract from English Wikipedia. */
async function getLead(title) {
  const u =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1` +
    `&titles=${encodeURIComponent(title)}` +
    `&prop=pageimages|extracts&piprop=original|name&exintro=1&explaintext=1`;
  const j = await api(u);
  const page = Object.values(j.query.pages)[0];
  if (!page || page.missing !== undefined) throw new Error("wiki page missing");
  return {
    fileTitle: page.pageimage ? `File:${page.pageimage}` : null,
    extract: stripHtml(page.extract),
  };
}

/** Licence, author and a thumbnail URL for a Commons File: page. */
async function getImageInfo(fileTitle) {
  const u =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&redirects=1` +
    `&titles=${encodeURIComponent(fileTitle)}` +
    `&prop=imageinfo&iiprop=extmetadata|url|mime|size&iiurlwidth=${THUMB_WIDTH}`;
  const j = await api(u);
  const page = Object.values(j.query.pages)[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata || {};
  const v = (k) => stripHtml(m[k]?.value);
  return {
    downloadUrl: ii.thumburl || ii.url,
    fullUrl: ii.url,
    mime: ii.mime,
    width: ii.thumbwidth || ii.width,
    height: ii.thumbheight || ii.height,
    license: v("LicenseShortName") || v("License"),
    licenseUrl: v("LicenseUrl"),
    artist: v("Artist") || "Unknown",
    credit: v("Credit"),
    descriptionUrl: ii.descriptionurl,
  };
}

function licenceIsFree(license) {
  if (!license) return false;
  if (NONFREE_RE.test(license)) return false;
  return FREE_RE.test(license);
}

function looksLikeImage(buf, mime) {
  // JPEG: FF D8 FF ; PNG: 89 50 4E 47 ; WEBP: "RIFF"...."WEBP"
  if (buf.length < 1500) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  )
    return "webp";
  // fall back to mime if magic bytes are unusual but content-type is image/*
  if (mime?.startsWith("image/")) return mime.split("/")[1].replace("jpeg", "jpg");
  return false;
}

async function download(url, destNoExt) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  const kind = looksLikeImage(buf, ct);
  if (!kind) throw new Error(`not a valid image (ct=${ct}, ${buf.length}b)`);
  const dest = `${destNoExt}.${kind}`;
  await writeFile(dest, buf);
  return { file: path.basename(dest), bytes: buf.length };
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });
  const seed = JSON.parse(await readFile(SEED, "utf8"));

  const out = [];
  const report = [];

  for (const s of seed) {
    try {
      const lead = await getLead(s.wikiTitle);
      if (!lead.fileTitle) throw new Error("no lead image");
      const info = await getImageInfo(lead.fileTitle);
      if (!info) throw new Error("no imageinfo");
      if (!licenceIsFree(info.license)) {
        report.push(`SKIP  ${s.name.padEnd(24)} — non-free licence: "${info.license}"`);
        await sleep(250);
        continue;
      }
      const dl = await download(info.downloadUrl, path.join(IMG_DIR, s.slug));
      const blurb =
        lead.extract.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".") || s.why;

      out.push({
        slug: s.slug,
        name: s.name,
        country: s.country,
        flag: s.flag,
        era: s.era,
        crown: s.crown,
        peak: s.peak ?? null,
        achievements: s.achievements,
        why: s.why,
        blurb,
        image: `/legends/${dl.file}`,
        width: info.width,
        height: info.height,
        credit: {
          artist: info.artist,
          license: info.license,
          licenseUrl: info.licenseUrl || null,
          source: info.descriptionUrl,
        },
        wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(s.wikiTitle)}`,
      });
      report.push(
        `OK    ${s.name.padEnd(24)} — ${(dl.bytes / 1024).toFixed(0)}KB · ${info.license}`
      );
    } catch (err) {
      report.push(`FAIL  ${s.name.padEnd(24)} — ${err.message}`);
    }
    await sleep(300); // be polite to the Wikimedia API
  }

  await writeFile(DATA_OUT, JSON.stringify(out, null, 2) + "\n");

  console.log("\n──────── Legends build ────────");
  console.log(report.join("\n"));
  console.log("───────────────────────────────");
  console.log(`Wrote ${out.length}/${seed.length} legends → ${path.relative(ROOT, DATA_OUT)}`);
  console.log(`Images → ${path.relative(ROOT, IMG_DIR)}/`);
  if (out.length < seed.length) {
    console.log("(skipped/failed entries above were left out — non-free or unavailable)");
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
