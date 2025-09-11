/**
 * データベースとPrismaスキーマの整合性チェックスクリプト
 * 
 * このスクリプトは以下を行います：
 * 1. 実際のデータベース構造をイントロスペクションで取得
 * 2. 現在のPrismaスキーマと比較
 * 3. 不一致を検出してレポート
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

// 一時ファイルのパス
const TEMP_SCHEMA_PATH = path.join(__dirname, '../prisma/temp/schema.introspected.prisma');
const CURRENT_SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');
const REPORT_PATH = path.join(__dirname, '../prisma/temp/schema_consistency_report.md');

// モデル情報を抽出する正規表現
const MODEL_REGEX = /model\s+(\w+)\s+{([^}]*)}/gs;
const FIELD_REGEX = /^\s*(\w+)\s+([^@\s]+)(.*)$/gm;

/**
 * データベースをイントロスペクションして一時スキーマファイルを作成
 */
async function introspectDatabase() {
  console.log('データベースをイントロスペクション中...');
  try {
    await execPromise('npx prisma db pull --schema=' + TEMP_SCHEMA_PATH);
    console.log('イントロスペクション完了');
    return true;
  } catch (error) {
    console.error('イントロスペクション失敗:', error.message);
    return false;
  }
}

/**
 * スキーマファイルからモデル情報を抽出
 */
function extractModels(schemaContent) {
  const models = {};
  let match;
  
  while ((match = MODEL_REGEX.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    
    const fields = {};
    let fieldMatch;
    
    while ((fieldMatch = FIELD_REGEX.exec(modelBody)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];
      const fieldAttrs = fieldMatch[3].trim();
      
      fields[fieldName] = {
        type: fieldType,
        attributes: fieldAttrs
      };
    }
    
    models[modelName] = {
      name: modelName,
      fields: fields
    };
  }
  
  return models;
}

/**
 * 2つのモデル定義を比較して違いを検出
 */
function compareModels(dbModels, schemaModels) {
  const differences = {
    missingModels: [],
    extraModels: [],
    modelDifferences: {}
  };
  
  // DBにあってスキーマにないモデル
  for (const modelName in dbModels) {
    if (!schemaModels[modelName]) {
      differences.missingModels.push(modelName);
    }
  }
  
  // スキーマにあってDBにないモデル
  for (const modelName in schemaModels) {
    if (!dbModels[modelName]) {
      differences.extraModels.push(modelName);
    }
  }
  
  // 共通のモデルのフィールド比較
  for (const modelName in dbModels) {
    if (!schemaModels[modelName]) continue;
    
    const dbFields = dbModels[modelName].fields;
    const schemaFields = schemaModels[modelName].fields;
    const fieldDiffs = {
      missingFields: [],
      extraFields: [],
      typeMismatches: []
    };
    
    // DBにあってスキーマにないフィールド
    for (const fieldName in dbFields) {
      if (!schemaFields[fieldName]) {
        fieldDiffs.missingFields.push(fieldName);
      } else if (dbFields[fieldName].type !== schemaFields[fieldName].type) {
        fieldDiffs.typeMismatches.push({
          field: fieldName,
          dbType: dbFields[fieldName].type,
          schemaType: schemaFields[fieldName].type
        });
      }
    }
    
    // スキーマにあってDBにないフィールド
    for (const fieldName in schemaFields) {
      if (!dbFields[fieldName]) {
        fieldDiffs.extraFields.push(fieldName);
      }
    }
    
    // 違いがあればレポートに追加
    if (fieldDiffs.missingFields.length > 0 || 
        fieldDiffs.extraFields.length > 0 || 
        fieldDiffs.typeMismatches.length > 0) {
      differences.modelDifferences[modelName] = fieldDiffs;
    }
  }
  
  return differences;
}

/**
 * 不一致レポートを生成
 */
function generateReport(differences) {
  let report = `# データベースとスキーマの整合性レポート\n\n`;
  report += `**生成日時**: ${new Date().toISOString()}\n\n`;
  
  // 概要
  const hasDifferences = 
    differences.missingModels.length > 0 || 
    differences.extraModels.length > 0 || 
    Object.keys(differences.modelDifferences).length > 0;
  
  if (!hasDifferences) {
    report += `## 結果: 一致\n\nデータベースとPrismaスキーマの間に不一致は見つかりませんでした。\n`;
    return report;
  }
  
  report += `## 結果: 不一致\n\nデータベースとPrismaスキーマの間に以下の不一致が見つかりました。\n\n`;
  
  // 不足モデル
  if (differences.missingModels.length > 0) {
    report += `### データベースにあってスキーマにないモデル\n\n`;
    differences.missingModels.forEach(model => {
      report += `- \`${model}\`\n`;
    });
    report += '\n';
  }
  
  // 余分モデル
  if (differences.extraModels.length > 0) {
    report += `### スキーマにあってデータベースにないモデル\n\n`;
    differences.extraModels.forEach(model => {
      report += `- \`${model}\`\n`;
    });
    report += '\n';
  }
  
  // フィールドの不一致
  if (Object.keys(differences.modelDifferences).length > 0) {
    report += `### フィールドの不一致\n\n`;
    
    for (const modelName in differences.modelDifferences) {
      report += `#### モデル: \`${modelName}\`\n\n`;
      const diffs = differences.modelDifferences[modelName];
      
      // 不足フィールド
      if (diffs.missingFields.length > 0) {
        report += `**データベースにあってスキーマにないフィールド:**\n\n`;
        diffs.missingFields.forEach(field => {
          report += `- \`${field}\`\n`;
        });
        report += '\n';
      }
      
      // 余分フィールド
      if (diffs.extraFields.length > 0) {
        report += `**スキーマにあってデータベースにないフィールド:**\n\n`;
        diffs.extraFields.forEach(field => {
          report += `- \`${field}\`\n`;
        });
        report += '\n';
      }
      
      // 型の不一致
      if (diffs.typeMismatches.length > 0) {
        report += `**型の不一致:**\n\n`;
        report += `| フィールド | データベースの型 | スキーマの型 |\n`;
        report += `|------------|-----------------|------------|\n`;
        diffs.typeMismatches.forEach(mismatch => {
          report += `| \`${mismatch.field}\` | \`${mismatch.dbType}\` | \`${mismatch.schemaType}\` |\n`;
        });
        report += '\n';
      }
    }
  }
  
  report += `## 推奨アクション\n\n`;
  report += `1. スキーマ定義を実際のデータベース構造と同期させる\n`;
  report += `2. 必要に応じてマイグレーションファイルを作成\n`;
  report += `3. アプリケーションコードが更新されたスキーマと互換性があることを確認\n`;
  
  return report;
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('データベースとスキーマの整合性チェックを開始します...');
    
    // データベースをイントロスペクション
    const introspectionSuccess = await introspectDatabase();
    if (!introspectionSuccess) {
      console.error('イントロスペクションに失敗しました。処理を中止します。');
      return;
    }
    
    // スキーマファイルを読み込み
    const dbSchema = fs.readFileSync(TEMP_SCHEMA_PATH, 'utf8');
    const currentSchema = fs.readFileSync(CURRENT_SCHEMA_PATH, 'utf8');
    
    // モデル情報を抽出
    console.log('モデル情報を抽出中...');
    const dbModels = extractModels(dbSchema);
    const schemaModels = extractModels(currentSchema);
    
    console.log(`データベースから ${Object.keys(dbModels).length} モデル抽出`);
    console.log(`スキーマから ${Object.keys(schemaModels).length} モデル抽出`);
    
    // モデルを比較
    console.log('モデルを比較中...');
    const differences = compareModels(dbModels, schemaModels);
    
    // レポート生成
    console.log('レポート生成中...');
    const report = generateReport(differences);
    fs.writeFileSync(REPORT_PATH, report);
    
    console.log(`レポートが生成されました: ${REPORT_PATH}`);
    
    // 不一致があるかどうかを出力
    const hasDifferences = 
      differences.missingModels.length > 0 || 
      differences.extraModels.length > 0 || 
      Object.keys(differences.modelDifferences).length > 0;
    
    if (hasDifferences) {
      console.log('警告: データベースとスキーマの間に不一致が見つかりました。');
      
      // 簡易レポートをコンソールに出力
      if (differences.missingModels.length > 0) {
        console.log(`\nデータベースにあってスキーマにないモデル: ${differences.missingModels.join(', ')}`);
      }
      
      if (differences.extraModels.length > 0) {
        console.log(`\nスキーマにあってデータベースにないモデル: ${differences.extraModels.join(', ')}`);
      }
      
      if (Object.keys(differences.modelDifferences).length > 0) {
        console.log('\nフィールドの不一致があるモデル:');
        Object.keys(differences.modelDifferences).forEach(model => {
          console.log(`- ${model}`);
        });
      }
      
      console.log(`\n詳細は ${REPORT_PATH} を確認してください。`);
    } else {
      console.log('データベースとスキーマは一致しています。');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // 一時ファイルを削除
    if (fs.existsSync(TEMP_SCHEMA_PATH)) {
      fs.unlinkSync(TEMP_SCHEMA_PATH);
    }
  }
}

// スクリプト実行
main();
