/**
 * このスクリプトは、Prismaクライアントの参照を更新するためのものです。
 * Prismaスキーマで@@mapディレクティブを使用した後、コード内の参照を
 * 新しいテーブル名（スネークケース・複数形）に合わせて更新します。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 変換マッピングの定義
const modelMappings = [
  // PascalCase/camelCaseからスネークケース/複数形への変換マッピング
  { from: 'page', to: 'pages' },
  { from: 'pageHistory', to: 'page_histories' },
  { from: 'responseNode', to: 'response_nodes' },
  { from: 'responseTree', to: 'response_trees' },
  { from: 'responseTreeVersion', to: 'response_tree_versions' },
  { from: 'responseTreeSession', to: 'response_tree_sessions' },
  { from: 'responseTreeMobileLink', to: 'response_tree_mobile_links' },
  { from: 'responseTreeHistory', to: 'response_tree_history' },
  { from: 'responseNodeTranslation', to: 'response_node_translations' },
  { from: 'campaign', to: 'campaigns' },
  { from: 'campaignCategory', to: 'campaign_categories' },
  { from: 'campaignCategoryRelation', to: 'campaign_category_relations' },
  { from: 'campaignItem', to: 'campaign_items' },
  { from: 'campaignTranslation', to: 'campaign_translations' },
  { from: 'campaignUsageLog', to: 'campaign_usage_logs' },
  { from: 'deviceVideoCache', to: 'device_video_caches' },
  { from: 'notificationTemplate', to: 'notification_templates' },
  { from: 'tenantAccessLog', to: 'tenant_access_logs' },
  { from: 'systemEvent', to: 'system_event' },
  { from: 'deviceRoom', to: 'device_rooms' },
  { from: 'order', to: 'order' }, // すでに@@mapで"order"に設定済み
  { from: 'orderItem', to: 'order_item' }, // すでに@@mapで"order_item"に設定済み
];

// 検索対象のディレクトリ
const searchDirs = [
  'src',
];

// 検索対象の拡張子
const extensions = ['.ts', '.js'];

// 無視するディレクトリ
const ignoreDirs = ['node_modules', '.git', 'dist', 'build'];

// ファイルを再帰的に検索
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// ファイル内の参照を更新
function updateReferences(filePath, dryRun = false) {
  console.log(`処理中: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changed = false;

  modelMappings.forEach(mapping => {
    // prisma.model.method() パターン
    const regex1 = new RegExp(`(\\b(?:prisma|db|tx|client)\\.)${mapping.from}(\\.[a-zA-Z]+\\()`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, `$1${mapping.to}$2`);
      changed = true;
    }

    // hotelDb.getClient().model.method() パターン
    const regex2 = new RegExp(`(hotelDb\\.getClient\\(\\)\\.)${mapping.from}(\\.[a-zA-Z]+\\()`, 'g');
    if (regex2.test(content)) {
      content = content.replace(regex2, `$1${mapping.to}$2`);
      changed = true;
    }

    // this.prismaClient.model.method() パターン
    const regex3 = new RegExp(`(this\\.prismaClient\\.)${mapping.from}(\\.[a-zA-Z]+\\()`, 'g');
    if (regex3.test(content)) {
      content = content.replace(regex3, `$1${mapping.to}$2`);
      changed = true;
    }
  });

  if (changed) {
    if (dryRun) {
      console.log(`  変更が必要: ${filePath}`);
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  更新しました: ${filePath}`);
    }
    return true;
  } else {
    return false;
  }
}

// メイン処理
function main(dryRun = false) {
  console.log(`Prismaクライアント参照の更新を開始します (ドライラン: ${dryRun})`);
  
  let changedFiles = 0;
  let processedFiles = 0;
  
  for (const dir of searchDirs) {
    const files = findFiles(dir);
    console.log(`${dir}ディレクトリで${files.length}個のファイルを検索します`);
    
    files.forEach(file => {
      processedFiles++;
      if (updateReferences(file, dryRun)) {
        changedFiles++;
      }
    });
  }
  
  console.log(`処理完了: ${processedFiles}ファイル中${changedFiles}ファイルを更新しました`);
  
  if (!dryRun && changedFiles > 0) {
    console.log('TypeScriptのエラーをチェックしています...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('TypeScriptのチェックが完了しました');
    } catch (error) {
      console.log('TypeScriptのエラーが残っています。手動で修正してください。');
    }
  }
}

// コマンドライン引数をパース
const dryRun = process.argv.includes('--dry-run');

// スクリプト実行
main(dryRun);
