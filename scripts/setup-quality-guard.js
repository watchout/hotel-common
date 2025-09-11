#!/usr/bin/env node
/*
  各プロジェクト（hotel-saas/hotel-member/hotel-pms/hotel-common）へ
  コーディング規約の実効性（品質ガード）を自動適用するスクリプト。
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MONO_ROOT = path.dirname(ROOT);

const DEFAULT_PROJECTS = ['hotel-saas', 'hotel-member', 'hotel-pms'];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

function copyIfMissing(src, dest) {
  if (!fs.existsSync(src)) return false;
  if (!fs.existsSync(path.dirname(dest))) ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function upsertTsconfig(projectPath) {
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');
  const baseExtends = path.relative(projectPath, path.join(ROOT, 'configs/tsconfig.base.json'));
  const current = readJson(tsconfigPath) || {};

  current.extends = current.extends || baseExtends;
  current.compilerOptions = current.compilerOptions || {};
  if (!current.compilerOptions.rootDir) current.compilerOptions.rootDir = './src';
  if (!current.compilerOptions.outDir) current.compilerOptions.outDir = './dist';
  if (!current.include) current.include = ['src/**/*'];

  writeJson(tsconfigPath, current);
}

function upsertPackageJson(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = readJson(pkgPath);
  if (!pkg) return false;

  pkg.scripts = pkg.scripts || {};
  pkg.scripts['quality:lint'] = pkg.scripts['quality:lint'] || 'eslint . --ext .ts,.tsx --max-warnings=0';
  pkg.scripts['quality:typecheck'] = pkg.scripts['quality:typecheck'] || 'tsc --noEmit';
  pkg.scripts['quality:detect'] = pkg.scripts['quality:detect'] || 'node scripts/detect-coding-violations.js';
  pkg.scripts['quality:all'] = pkg.scripts['quality:all'] || 'npm run quality:lint && npm run quality:typecheck';
  pkg.scripts['quality:ci'] = pkg.scripts['quality:ci'] || 'npm run quality:all && npm run quality:detect';

  pkg.engines = pkg.engines || {};
  pkg.engines.node = pkg.engines.node || '>=20.0.0';

  pkg.devDependencies = pkg.devDependencies || {};
  const devDeps = {
    eslint: '^9.9.0',
    prettier: '^3.3.3',
    '@typescript-eslint/parser': '^8.1.0',
    '@typescript-eslint/eslint-plugin': '^8.1.0',
    'eslint-config-prettier': '^9.1.0',
    'eslint-plugin-import': '^2.29.1',
    typescript: '^5.8.3',
    '@types/node': '^20.14.9',
  };
  for (const [k, v] of Object.entries(devDeps)) {
    if (!pkg.devDependencies[k]) pkg.devDependencies[k] = v;
  }

  writeJson(pkgPath, pkg);
  return true;
}

function setupPreCommit(projectPath) {
  const hookSrc = path.join(ROOT, 'scripts/git-hooks/pre-commit');
  const hookDestDir = path.join(projectPath, '.git/hooks');
  const hookDest = path.join(hookDestDir, 'pre-commit');
  if (!fs.existsSync(hookDestDir)) return false; // Git未初期化の可能性
  ensureDir(hookDestDir);
  fs.copyFileSync(hookSrc, hookDest);
  fs.chmodSync(hookDest, 0o755);
  return true;
}

function main() {
  const targets = process.argv.slice(2);
  const projects = targets.length ? targets : DEFAULT_PROJECTS;

  const results = [];
  for (const name of projects) {
    const p = path.join(MONO_ROOT, name);
    const exists = fs.existsSync(p);
    if (!exists) {
      results.push({ project: name, status: 'skipped', reason: 'not found' });
      continue;
    }

    // 1) tsconfig
    upsertTsconfig(p);

    // 2) ESLint/Prettier config
    copyIfMissing(path.join(ROOT, '.eslintrc.cjs'), path.join(p, '.eslintrc.cjs'));
    copyIfMissing(path.join(ROOT, '.prettierrc.json'), path.join(p, '.prettierrc.json'));
    // ignores
    fs.writeFileSync(path.join(p, '.eslintignore'), 'dist\nnode_modules\ncoverage\n');
    fs.writeFileSync(path.join(p, '.prettierignore'), 'dist\nnode_modules\ncoverage\n');

    // 3) GitHub Actions
    const wfSrc = path.join(ROOT, '.github/workflows/quality-gate.yml');
    const wfDest = path.join(p, '.github/workflows/quality-gate.yml');
    ensureDir(path.dirname(wfDest));
    copyIfMissing(wfSrc, wfDest);

    // 4) 検知スクリプトのコピー（pre-commitやCIが参照できるように）
    const detectSrc = path.join(ROOT, 'scripts/detect-coding-violations.js');
    const detectDest = path.join(p, 'scripts/detect-coding-violations.js');
    ensureDir(path.dirname(detectDest));
    copyIfMissing(detectSrc, detectDest);

    // 5) package.json 更新
    const updated = upsertPackageJson(p);

    // 6) pre-commit hook
    const hookSet = setupPreCommit(p);

    results.push({ project: name, status: 'ok', packageUpdated: !!updated, hookSet });
  }

  console.log('品質ガード適用結果:\n', results);
  console.log('\n次のコマンドを各プロジェクトで実行してください:');
  console.log('  npm install');
  console.log('  npm run quality:all');
}

if (require.main === module) {
  main();
}



