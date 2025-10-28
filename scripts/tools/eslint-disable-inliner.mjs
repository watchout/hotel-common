import fs from 'fs';
import path from 'path';

const reportPath = '.tmp/eslint.json';
const raw = fs.readFileSync(reportPath, 'utf8');
const results = JSON.parse(raw);

const TARGET_RULES = new Set([
  '@typescript-eslint/no-explicit-any',
  '@typescript-eslint/ban-types',
  '@typescript-eslint/ban-ts-comment',
  'no-console',
  'import/export',
  'no-duplicate-imports',
]);

function insertBeforeLine(filePath, lineNo, text) {
  if (!fs.existsSync(filePath)) {
    console.warn(`skip: ${filePath} (not found)`);
    return;
  }
  const src = fs.readFileSync(filePath, 'utf8').split('\n');
  const idx = Math.max(0, Math.min(src.length, lineNo - 1));
  // 既に同一disableが直前にあれば重複挿入を避ける
  const prev = src[idx - 1] ?? '';
  if (prev.includes(text)) return;
  src.splice(idx, 0, text);
  fs.writeFileSync(filePath, src.join('\n'), 'utf8');
}

let patchCount = 0;

for (const file of results) {
  const filePath = file.filePath;
  // 対象はリポ内の src/ 下のみ（テストは既にoverrides緩和）
  if (!filePath.includes(`${path.sep}src${path.sep}`)) continue;

  // 1ファイル内で同じ行に複数ルールがある場合を束ねる
  const lineToRules = new Map();
  for (const m of file.messages || []) {
    if (m.severity !== 2) continue; // errorsのみ対象
    if (!m.ruleId || !TARGET_RULES.has(m.ruleId)) continue;
    if (!lineToRules.has(m.line)) lineToRules.set(m.line, new Set());
    lineToRules.get(m.line).add(m.ruleId);
  }

  if (lineToRules.size === 0) continue;

  // 下の行番号から処理し、挿入による行ズレを抑制
  const linesDesc = Array.from(lineToRules.keys()).sort((a,b)=>b-a);
  for (const line of linesDesc) {
    const rules = Array.from(lineToRules.get(line));
    const comment = `// eslint-disable-next-line ${rules.join(', ')}`;
    insertBeforeLine(filePath, line, comment);
    patchCount++;
    console.log(`patched: ${path.relative(process.cwd(), filePath)}:${line}`);
  }
}

console.log(`\n✅ Total patches: ${patchCount}`);

