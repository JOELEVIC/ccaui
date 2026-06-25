"use client";

/**
 * Engine resource manager — makes the Stockfish WASM load robust:
 *
 *  • Pre-flight: confirm the engine resource is available AND probe the backend
 *    BEFORE a flow (e.g. placement) starts, so we never begin with no usable engine.
 *  • Warm: kick the Render backend so the fallback isn't a cold ~5s start.
 *  • Durable, eviction-resistant persistence: request persistent storage and keep
 *    a verified copy of the 7 MB wasm in TWO locations (Cache Storage + IndexedDB),
 *    repairing one from the other. A scoped service worker then serves
 *    /stockfish/* from Cache Storage so the worker loads the durable copy even if
 *    the browser evicts its HTTP disk cache.
 *  • Integrity: a cached/copied wasm is only trusted if it's a plausible size
 *    (a truncated download or an HTML error page is far smaller).
 *
 * Everything here is best-effort and never throws — failures degrade to the
 * normal network/HTTP-cache path.
 */

import { getGameApiUrl } from "@/lib/game-api";

const ENGINE_JS = "/stockfish/stockfish-18-lite-single.js";
const ENGINE_WASM = "/stockfish/stockfish-18-lite-single.wasm";

const CACHE_NAME = "cca-engine-v1";
const IDB_NAME = "cca-engine";
const IDB_STORE = "assets";

/** A valid wasm is ~7.3 MB; anything under ~3 MB is truncated/corrupt/an error page. */
const MIN_WASM_BYTES = 3_000_000;

export type WasmSource = "cache" | "idb" | "network" | "none";
export type BackendState = "ready" | "down" | "unknown";

export interface EnginePreflight {
  /** True if at least one analysis path (in-browser wasm or backend) is usable. */
  ok: boolean;
  /** In-browser engine availability. */
  wasm: "ready" | "unavailable";
  /** Where the durable wasm copy came from. */
  source: WasmSource;
  /** Backend (Render) engine state. */
  backend: BackendState;
  /** Whether the browser granted persistent (eviction-resistant) storage. */
  persisted: boolean;
}

const isBrowser = () => typeof window !== "undefined";
const hasCaches = () => typeof caches !== "undefined";
const hasIDB = () => typeof indexedDB !== "undefined";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let done = false;
    const t = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(fallback);
      }
    }, ms);
    p.then((v) => {
      if (!done) {
        done = true;
        clearTimeout(t);
        resolve(v);
      }
    }).catch(() => {
      if (!done) {
        done = true;
        clearTimeout(t);
        resolve(fallback);
      }
    });
  });
}

// ── persistent storage ──────────────────────────────────────────────────────

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted) {
      if (await navigator.storage.persisted()) return true;
    }
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* ignore */
  }
  return false;
}

// ── IndexedDB (location 2) ──────────────────────────────────────────────────

function idbOpen(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!hasIDB()) return resolve(null);
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function idbGet(key: string): Promise<ArrayBuffer | null> {
  return idbOpen().then(
    (db) =>
      new Promise<ArrayBuffer | null>((resolve) => {
        if (!db) return resolve(null);
        try {
          const req = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
          req.onsuccess = () => resolve((req.result as ArrayBuffer) ?? null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      })
  );
}

function idbPut(key: string, buf: ArrayBuffer): Promise<void> {
  return idbOpen().then(
    (db) =>
      new Promise<void>((resolve) => {
        if (!db) return resolve();
        try {
          const tx = db.transaction(IDB_STORE, "readwrite");
          tx.objectStore(IDB_STORE).put(buf, key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      })
  );
}

// ── Cache Storage (location 1, what the service worker serves) ───────────────

async function cacheGet(url: string): Promise<ArrayBuffer | null> {
  if (!hasCaches()) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(url);
    if (!res) return null;
    const buf = await res.arrayBuffer();
    return buf.byteLength >= MIN_WASM_BYTES || !url.endsWith(".wasm") ? buf : null;
  } catch {
    return null;
  }
}

async function cachePut(url: string, buf: ArrayBuffer): Promise<void> {
  if (!hasCaches()) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const type = url.endsWith(".wasm") ? "application/wasm" : "text/javascript";
    await cache.put(url, new Response(buf, { headers: { "Content-Type": type } }));
  } catch {
    /* ignore */
  }
}

async function fetchAsset(url: string, reload = false): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { cache: reload ? "reload" : "force-cache" });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (url.endsWith(".wasm") && buf.byteLength < MIN_WASM_BYTES) {
      // Truncated / error page — retry bypassing cache once.
      if (!reload) return fetchAsset(url, true);
      return null;
    }
    return buf;
  } catch {
    return null;
  }
}

/**
 * Ensure a verified wasm copy exists in BOTH durable locations and report where
 * it came from. Repairs a missing/corrupt location from a healthy one or network.
 */
async function ensureDurableWasm(): Promise<WasmSource> {
  // 1) Cache Storage (the location the SW serves from).
  const fromCache = await cacheGet(ENGINE_WASM);
  if (fromCache) {
    // Mirror into IDB if missing, for redundancy.
    const idb = await idbGet(ENGINE_WASM);
    if (!idb || idb.byteLength < MIN_WASM_BYTES) void idbPut(ENGINE_WASM, fromCache);
    return "cache";
  }
  // 2) IndexedDB — repair Cache Storage from it.
  const fromIdb = await idbGet(ENGINE_WASM);
  if (fromIdb && fromIdb.byteLength >= MIN_WASM_BYTES) {
    await cachePut(ENGINE_WASM, fromIdb);
    return "idb";
  }
  // 3) Network — populate both locations.
  const buf = await fetchAsset(ENGINE_WASM);
  if (buf) {
    await Promise.all([cachePut(ENGINE_WASM, buf), idbPut(ENGINE_WASM, buf)]);
    // Also cache the small JS loader so the SW can serve it too.
    void fetchAsset(ENGINE_JS).then((js) => js && cachePut(ENGINE_JS, js));
    return "network";
  }
  return "none";
}

// ── service worker (serves /stockfish/* from Cache Storage) ──────────────────

export function registerEngineServiceWorker(): void {
  try {
    if (!isBrowser() || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/engine-sw.js", { scope: "/" }).catch(() => {
      /* best-effort; engine still works via HTTP cache */
    });
  } catch {
    /* ignore */
  }
}

// ── backend (Render) checks ─────────────────────────────────────────────────

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

async function pingBackend(timeoutMs: number): Promise<boolean> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(getGameApiUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: "query($f:String!){ engineEvaluation(fen:$f){ cp } }",
        variables: { f: START_FEN },
      }),
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return false;
    const json = await res.json();
    return !json.errors;
  } catch {
    return false;
  }
}

export async function checkBackend(timeoutMs = 4000): Promise<BackendState> {
  return (await pingBackend(timeoutMs)) ? "ready" : "down";
}

/** Fire-and-forget request to spin up a cold Render instance. */
export function warmBackend(): void {
  void pingBackend(30000);
}

// ── orchestration ───────────────────────────────────────────────────────────

/**
 * Run BEFORE a flow that needs the engine. Registers the SW, requests persistent
 * storage, ensures a durable verified wasm copy, and probes/warms the backend.
 */
export async function preflightEngine(): Promise<EnginePreflight> {
  if (!isBrowser()) {
    return { ok: false, wasm: "unavailable", source: "none", backend: "unknown", persisted: false };
  }

  registerEngineServiceWorker();
  const persisted = await requestPersistentStorage();

  const wasmCapable = typeof Worker !== "undefined" && typeof WebAssembly !== "undefined";

  const [source, backend] = await Promise.all([
    wasmCapable ? withTimeout(ensureDurableWasm(), 30000, "none" as WasmSource) : Promise.resolve("none" as WasmSource),
    checkBackend(4000),
  ]);

  // If the backend looks down/cold, kick it so the fallback path is warm.
  if (backend !== "ready") warmBackend();

  const wasm: EnginePreflight["wasm"] = source === "none" ? "unavailable" : "ready";
  return {
    ok: wasm === "ready" || backend === "ready",
    wasm,
    source,
    backend,
    persisted,
  };
}
