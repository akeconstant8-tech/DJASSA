// Liste les icônes Material Symbols utilisées dans src/ et vérifie qu'index.html les charge toutes.
// La police est limitée à ces icônes (paramètre icon_names) : ~3,9 Mo → quelques Ko.
// Usage : npm run icons        → vérifie (échoue si une icône manque)
//         npm run icons -- --print  → affiche la valeur à coller dans index.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
})(path.join(root, 'src'));

const icons = new Set();
const patterns = [
  /material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g, // <span className="material-symbols-outlined">icon</span>
  /\bicon:\s*(?:[^,}]*\?\s*)?'([a-z0-9_]+)'(?:\s*:\s*'([a-z0-9_]+)')?/g // icon: 'x' ou icon: cond ? 'x' : 'y'
];
for (const file of files) {
  if (file.endsWith('CatalogView.tsx')) continue; // prototype non utilisé
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      match.slice(1).filter(Boolean).forEach((name) => icons.add(name));
    }
  }
}

const sorted = [...icons].sort(); // Google exige l'ordre alphabétique
if (process.argv.includes('--print')) {
  console.log(sorted.join(','));
  process.exit(0);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const loaded = new Set((html.match(/icon_names=([a-z0-9_,]+)/) || [, ''])[1].split(',').filter(Boolean));
const missing = sorted.filter((name) => !loaded.has(name));
if (missing.length) {
  console.error(`Icônes utilisées mais absentes de index.html (icon_names) : ${missing.join(', ')}`);
  console.error(`Valeur attendue : ${sorted.join(',')}`);
  process.exit(1);
}
console.log(`${sorted.length} icônes, toutes chargées par index.html.`);
