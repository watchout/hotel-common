/**
 * Prismaスキーマに@@mapディレクティブを追加するスクリプト
 * 
 * 使用方法:
 * node scripts/add-mapping-directives.js [--dry-run] [--models=model1,model2]
 * 
 * オプション:
 * --dry-run: 変更を適用せず、変更内容のみを表示
 * --models: カンマ区切りのモデル名リスト。指定したモデルのみ処理
 */

const fs = require('fs');
const path = require('path');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
let targetModels = [];

// モデル指定の解析
const modelArg = args.find(arg => arg.startsWith('--models='));
if (modelArg) {
  targetModels = modelArg.replace('--models=', '').split(',');
}

// スキーマファイルのパス
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

// スキーマファイルの読み込み
let schemaContent;
try {
  schemaContent = fs.readFileSync(schemaPath, 'utf8');
} catch (error) {
  console.error(`スキーマファイルの読み込みに失敗しました: ${error.message}`);
  process.exit(1);
}

// モデル定義を抽出
const modelRegex = /(model\s+(\w+)\s+{[\s\S]*?})/g;
const models = [];
let match;

while ((match = modelRegex.exec(schemaContent)) !== null) {
  const [fullMatch, modelDefinition, modelName] = match;
  
  // 特定のモデルのみを処理する場合、対象外のモデルはスキップ
  if (targetModels.length > 0 && !targetModels.includes(modelName)) {
    continue;
  }
  
  models.push({
    name: modelName,
    definition: modelDefinition,
    startIndex: match.index,
    endIndex: match.index + fullMatch.length
  });
}

console.log(`${models.length}個のモデルを処理します`);

// マッピングディレクティブを追加
let newSchemaContent = schemaContent;
let offset = 0;

for (const model of models) {
  // すでにマッピングディレクティブが存在するかチェック
  if (model.definition.includes('@@map(')) {
    console.log(`${model.name}: マッピングディレクティブがすでに存在します`);
    continue;
  }
  
  // モデル名をsnake_caseに変換
  const tableName = model.name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
  
  // 閉じ括弧の前にマッピングディレクティブを挿入
  const closingBraceIndex = model.definition.lastIndexOf('}');
  if (closingBraceIndex === -1) {
    console.log(`${model.name}: モデル定義の閉じ括弧が見つかりません`);
    continue;
  }
  
  const insertPosition = model.startIndex + closingBraceIndex + offset;
  const mapDirective = `\n\n  @@map("${tableName}")`;
  
  newSchemaContent = 
    newSchemaContent.substring(0, insertPosition) + 
    mapDirective + 
    newSchemaContent.substring(insertPosition);
  
  offset += mapDirective.length;
  
  console.log(`${model.name}: マッピングディレクティブを追加しました (テーブル名: ${tableName})`);
}

// 変更の適用
if (dryRun) {
  console.log('\n--- ドライランモード: 変更は適用されません ---');
  console.log(newSchemaContent);
} else {
  try {
    fs.writeFileSync(schemaPath, newSchemaContent, 'utf8');
    console.log('\nスキーマファイルを更新しました');
  } catch (error) {
    console.error(`スキーマファイルの更新に失敗しました: ${error.message}`);
    process.exit(1);
  }
}

console.log('\n完了しました');
