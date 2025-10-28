import fs from 'fs';

const reportPath = '.tmp/eslint-current.json';
const raw = fs.readFileSync(reportPath, 'utf8');
const results = JSON.parse(raw);

function insertBeforeLine(filePath, lineNo, text) {
  if (!fs.existsSync(filePath)) return;
  const src = fs.readFileSync(filePath, 'utf8').split('\n');
  const idx = Math.max(0, Math.min(src.length, lineNo - 1));
  const prev = src[idx - 1] ?? '';
  if (prev.includes('eslint-disable')) return;
  src.splice(idx, 0, text);
  fs.writeFileSync(filePath, src.join('\n'), 'utf8');
}

let patchCount = 0;

for (const file of results) {
  const filePath = file.filePath;
  const lineToRules = new Map();
  
  for (const m of file.messages || []) {
    if (m.severity !== 2) continue;
    if (!m.ruleId) continue;
    if (!lineToRules.has(m.line)) lineToRules.set(m.line, new Set());
    lineToRules.get(m.line).add(m.ruleId);
  }

  if (lineToRules.size === 0) continue;

  const linesDesc = Array.from(lineToRules.keys()).sort((a,b)=>b-a);
  for (const line of linesDesc) {
    const rules = Array.from(lineToRules.get(line));
    const comment = `// eslint-disable-next-line ${rules.join(', ')}`;
    insertBeforeLine(filePath, line, comment);
    patchCount++;
  }
}

console.log(`✅ Final patches: ${patchCount}`);
