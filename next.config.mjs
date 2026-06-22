/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Stockfish engine assets (worker .js + .wasm). Cache aggressively so
        // a client only fetches the 7 MB wasm once, and tag with a resource
        // policy so the Web Worker is allowed to instantiate it.
        source: "/stockfish/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        // Ensure the wasm is served with the correct MIME type; some hosts
        // mislabel it, which breaks WebAssembly.instantiateStreaming.
        source: "/stockfish/:file*.wasm",
        headers: [{ key: "Content-Type", value: "application/wasm" }],
      },
    ];
  },
};

export default nextConfig;
