#!/usr/bin/env node
/**
 * Route Quality Check
 * - Fails when:
 *   1) Files named `index.*` exist under `src/routes/**`
 *   2) Route file path depth exceeds MAX_DEPTH (relative to `src/routes`)
 *
 * Env:
 *   ROUTE_MAX_DEPTH (default: 4)
 */

const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.resolve(process.cwd(), 'src/routes');
const MAX_DEPTH = parseInt(process.env.ROUTE_MAX_DEPTH || '4', 10);

/** @type {string[]} */
const violations = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      checkFile(full);
    }
  }
}

function checkFile(filePath) {
  const relFromRoutes = path.relative(ROUTES_DIR, filePath);
  // Skip files outside routes directory
  if (relFromRoutes.startsWith('..')) return;

  // 1) index.* 禁止
  const base = path.basename(filePath).toLowerCase();
  if (base.startsWith('index.')) {
    violations.push(`index file is forbidden: ${normalize(filePath)}`);
  }

  // 2) 深すぎるパスを禁止（セグメント数）
  const segs = relFromRoutes.split(path.sep).filter(Boolean);
  if (segs.length > MAX_DEPTH) {
    violations.push(
      `route depth exceeds ${MAX_DEPTH}: ${normalize(filePath)} (depth=${segs.length})`
    );
  }
}

function normalize(p) {
  return p.replace(process.cwd() + path.sep, '');
}

function main() {
  if (!fs.existsSync(ROUTES_DIR)) {
    console.log(`[route-check] routes directory not found: ${normalize(ROUTES_DIR)} — skipping`);
    process.exit(0);
  }

  walk(ROUTES_DIR);

  if (violations.length > 0) {
    console.error('\n[route-check] Violations found:');
    for (const v of violations) console.error(`  - ${v}`);
    console.error(`\n[route-check] FAIL (${violations.length} problems)`);
    process.exit(1);
  }

  console.log('[route-check] OK');
}

main();


