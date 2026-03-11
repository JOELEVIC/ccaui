#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../node_modules/stockfish/bin");
const destDir = path.join(__dirname, "../public/stockfish");

if (!fs.existsSync(srcDir)) {
  console.warn("Stockfish not installed, skipping copy");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(
  path.join(srcDir, "stockfish-18-lite-single.js"),
  path.join(destDir, "stockfish-18-lite-single.js")
);
fs.copyFileSync(
  path.join(srcDir, "stockfish-18-lite-single.wasm"),
  path.join(destDir, "stockfish.wasm")
);
console.log("Stockfish files copied to public/stockfish");
