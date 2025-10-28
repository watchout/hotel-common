import fs from 'fs';
import path from 'path';

// buildエラーログから implicitly has 'any' type のファイル/行を抽出
const logPath = '.tmp/build-errors.txt';
if (!fs.existsSync(logPath)) {
  console.error('Error: .tmp/build-errors.txt not found. Run `npm run build` first.');
  process.exit(1);
}

const errorLog = fs.readFileSync(logPath, 'utf8');
const implicitAnyPattern = /(^|\n)([^\n]+?)\((\d+),(\d+)\): error TS\d+: Parameter '([A-Za-z_$][\w$]*)' implicitly has an 'any' type\./g;

const fixes = [];
let match;
while ((match = implicitAnyPattern.exec(errorLog)) !== null) {
  const filePath = match[2].trim();
  const lineStr = match[3];
  const paramName = match[5];
  fixes.push({ filePath, line: parseInt(lineStr, 10), paramName });
}

console.log(`Found ${fixes.length} implicit any errors`);

// ファイルごとにグループ化して修正
const fileGroups = new Map();
for (const fix of fixes) {
  if (!fileGroups.has(fix.filePath)) fileGroups.set(fix.filePath, []);
  fileGroups.get(fix.filePath).push(fix);
}

let fixed = 0;
for (const [filePath, fileFixes] of fileGroups.entries()) {
  if (!fs.existsSync(filePath)) {
    console.warn(`skip: ${filePath} (not found)`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');

  // 下の行から修正（行番号ズレ防止）
  const sortedFixes = fileFixes.sort((a, b) => b.line - a.line);

  for (const fix of sortedFixes) {
    const lineIdx = fix.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    const line = lines[lineIdx];
    // 安全な置換: 関数パラメータ括弧内のみに限定
    // パターン: ( param ) / (, param ) の直後が ) または , のケース
    const safeParamRegex = new RegExp(`(\\(|,\\s*)${fix.paramName}(\\s*(?:[,)]))`);
    if (safeParamRegex.test(line)) {
      lines[lineIdx] = line.replace(safeParamRegex, `$1${fix.paramName}: any$2`);
      console.log(`Fixed: ${path.relative(process.cwd(), filePath)}:${fix.line} - ${fix.paramName}`);
      fixed++;
    }
  }

  const updated = lines.join('\n');
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
}

console.log(`✅ Type annotations added: ${fixed}`);

