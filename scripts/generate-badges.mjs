/**
 * generate-badges.mjs
 *
 * Generates SVG badge files at build time using badge-maker.
 * Badges are committed to the repo so the README can reference
 * them as local files - no external badge service required.
 *
 * Generated files: badges/{version,license,types,node}.svg
 *
 * Run:  node scripts/generate-badges.mjs
 * Auto: runs before every `tsup` build via the `prebuild` script.
 */

import { makeBadge } from 'badge-maker';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Read package metadata ──────────────────────────────────────────────────

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const version = pkg.version ?? '0.0.0';
const license = pkg.license ?? 'MIT';
const nodeRange = pkg.engines?.node ?? '>=18';

// ── Shared style ───────────────────────────────────────────────────────────

/** @type {import('badge-maker').Format['style']} */
const STYLE = 'flat';

// ── Badge definitions ───────────────────────────────────────────────────────
//
// Each entry produces one SVG file written to badges/<name>.svg.
// The README links each badge to a relevant URL (see README.md).

const badges = [
  {
    name: 'version',
    format: {
      label: 'npm',
      message: `v${version}`,
      color: '#CB3837', // npm red
      style: STYLE,
    },
  },
  {
    name: 'license',
    format: {
      label: 'license',
      message: license,
      color: '#4c1',
      style: STYLE,
    },
  },
  {
    name: 'types',
    format: {
      label: 'npm type definitions',
      message: 'TypeScript',
      color: '#3178c6', // TypeScript blue
      style: STYLE,
    },
  },
  {
    name: 'node',
    format: {
      label: 'node',
      message: nodeRange,
      color: '#339933', // Node.js green
      style: STYLE,
    },
  },
];

// ── Write SVGs ─────────────────────────────────────────────────────────────

const outDir = join(root, 'badges');
mkdirSync(outDir, { recursive: true });

for (const { name, format } of badges) {
  const svg = makeBadge(format);
  const dest = join(outDir, `${name}.svg`);
  writeFileSync(dest, svg, 'utf8');
  console.log(`  ✓ badges/${name}.svg  [${format.label}: ${format.message}]`);
}

console.log(`\nbadges generated from package@${version}`);
