import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-threejs.ts';

// Resolve environment variables and working directories
const botDir = process.env.MAKEFUN_BOT_DIR ?? resolve(fileURLToPath(new URL('.', import.meta.url)));
const here = botDir;
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

console.log(`[makefun-threejs] Packaging tactical FPS game from: ${here} to: ${out}`);
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Scorer caps from reference/gate.json
const dossierContent = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossierContent);
console.log('[makefun-threejs] Successfully built dossier.json with caps.');
