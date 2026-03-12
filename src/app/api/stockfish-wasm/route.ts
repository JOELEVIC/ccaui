import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  const cwd = process.cwd();
  const paths = [
    join(cwd, "public/stockfish/stockfish.wasm"),
    join(cwd, "node_modules/stockfish/bin/stockfish-18-lite-single.wasm"),
  ];
  for (const wasmPath of paths) {
    try {
      const buffer = await readFile(wasmPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/wasm",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      continue;
    }
  }
  return new NextResponse("Stockfish WASM not found", { status: 404 });
}
