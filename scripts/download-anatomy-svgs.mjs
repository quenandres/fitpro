#!/usr/bin/env node
/**
 * Descargador automático de SVGs de anatomía.
 *
 * Lee las URLs desde data/list_body_svg.json (campo "all") y descarga cada
 * archivo en data/anatomy_svgs/, conservando la última parte de la URL como
 * nombre de archivo. Usa concurrencia limitada y reintentos para robustez.
 *
 * Uso:
 *   node scripts/download-anatomy-svgs.mjs
 *   node scripts/download-anatomy-svgs.mjs --force     // re-descarga aunque existan
 *   node scripts/download-anatomy-svgs.mjs --concurrency=8
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(PROJECT_ROOT, "data", "list_body_svg.json");
const OUT_DIR = path.join(PROJECT_ROOT, "data", "anatomy_svgs");

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const FORCE = Boolean(args.get("force"));
const CONCURRENCY = Number(args.get("concurrency") ?? 6);
const MAX_RETRIES = Number(args.get("retries") ?? 3);
const TIMEOUT_MS = Number(args.get("timeout") ?? 20000);

const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(color, symbol, msg) {
  console.log(`${color}${symbol}${COLORS.reset} ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fileNameFromUrl(url) {
  const { pathname } = new URL(url);
  return decodeURIComponent(path.basename(pathname));
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(p) {
  try {
    const stat = await fs.stat(p);
    return stat.size > 0;
  } catch {
    return false;
  }
}

async function downloadOne(url, destDir) {
  const fileName = fileNameFromUrl(url);
  const destPath = path.join(destDir, fileName);

  if (!FORCE && (await fileExists(destPath))) {
    return { url, fileName, status: "skipped" };
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (fitpro-anatomy-downloader) AppleWebKit/537.36",
          Accept: "image/svg+xml,*/*",
        },
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error("Empty response body");

      const tmpPath = `${destPath}.part`;
      await fs.writeFile(tmpPath, buf);
      await fs.rename(tmpPath, destPath);

      return { url, fileName, status: "ok", bytes: buf.length };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(500 * attempt);
      }
    }
  }

  return {
    url,
    fileName,
    status: "error",
    error: lastError?.message ?? String(lastError),
  };
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;
  let done = 0;
  const total = items.length;

  async function loop() {
    while (cursor < items.length) {
      const i = cursor++;
      const r = await worker(items[i], i);
      results[i] = r;
      done++;
      const tag =
        r.status === "ok"
          ? `${COLORS.green}OK     ${COLORS.reset}`
          : r.status === "skipped"
          ? `${COLORS.gray}SKIP   ${COLORS.reset}`
          : `${COLORS.red}FAIL   ${COLORS.reset}`;
      const progress = `[${String(done).padStart(String(total).length, " ")}/${total}]`;
      const extra = r.error ? ` ${COLORS.red}(${r.error})${COLORS.reset}` : "";
      console.log(`${progress} ${tag} ${r.fileName}${extra}`);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, loop);
  await Promise.all(runners);
  return results;
}

async function main() {
  log(COLORS.cyan + COLORS.bold, "▶", `Leyendo ${path.relative(PROJECT_ROOT, JSON_PATH)}`);
  const raw = await fs.readFile(JSON_PATH, "utf8");
  const data = JSON.parse(raw);

  const urls = Array.isArray(data.all) && data.all.length > 0
    ? data.all
    : [
        ...(data.silhouettes ?? []),
        ...Object.values(data.muscles ?? {}).flatMap((v) =>
          Object.values(v ?? {}).flat()
        ),
      ];

  const unique = Array.from(new Set(urls));
  log(
    COLORS.cyan,
    "•",
    `${unique.length} URLs únicas (de ${urls.length} totales) → ${path.relative(
      PROJECT_ROOT,
      OUT_DIR
    )}`
  );
  log(
    COLORS.gray,
    "•",
    `concurrencia=${CONCURRENCY}  reintentos=${MAX_RETRIES}  timeout=${TIMEOUT_MS}ms  force=${FORCE}`
  );

  await ensureDir(OUT_DIR);

  const start = Date.now();
  const results = await runPool(
    unique,
    (url) => downloadOne(url, OUT_DIR),
    CONCURRENCY
  );
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  const ok = results.filter((r) => r.status === "ok");
  const skipped = results.filter((r) => r.status === "skipped");
  const failed = results.filter((r) => r.status === "error");
  const bytes = ok.reduce((acc, r) => acc + (r.bytes ?? 0), 0);

  console.log("");
  log(COLORS.bold + COLORS.green, "✓", `Descargados: ${ok.length}`);
  log(COLORS.bold + COLORS.gray, "·", `Saltados:    ${skipped.length}`);
  log(
    failed.length ? COLORS.bold + COLORS.red : COLORS.bold + COLORS.gray,
    failed.length ? "✗" : "·",
    `Fallidos:    ${failed.length}`
  );
  log(
    COLORS.cyan,
    "Σ",
    `${(bytes / 1024).toFixed(1)} KiB en ${elapsed}s · salida: ${path.relative(
      PROJECT_ROOT,
      OUT_DIR
    )}`
  );

  if (failed.length) {
    console.log("");
    log(COLORS.red, "!", "URLs fallidas:");
    for (const f of failed) console.log(`   - ${f.url}  →  ${f.error}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`${COLORS.red}Fatal:${COLORS.reset}`, err);
  process.exit(1);
});
