/**
 * データベーススキーマとPrismaスキーマの整合性を検証するスクリプト
 * 
 * 使用方法:
 * node scripts/validate-schema-db.js
 * 
 * 環境変数:
 * DATABASE_URL - 検証対象のデータベースURL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 一時ファイル名の設定
const tempDir = path.join(__dirname, '../prisma/temp');
const tempSchemaPath = path.join(tempDir, 'temp-schema.prisma');
const currentSchemaPath = path.join(__dirname, '../prisma/schema.prisma');

// 一時ディレクトリの作成
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 結果を保存するオブジェクト
const validationResult = {
  missingInSchema: [],
  missingInDb: [],
  fieldDifferences: [],
  isValid: true
};

try {
  console.log('データベース構造をエクスポート中...');
  execSync(`npx prisma db pull --schema=${tempSchemaPath}`, { stdio: 'inherit' });
  
  console.log('スキーマの差分を確認中...');
  
  // ファイルの内容を読み込み
  const currentSchema = fs.readFileSync(currentSchemaPath, 'utf8');
  const dbSchema = fs.readFileSync(tempSchemaPath, 'utf8');
  
  // モデル定義のみを抽出する関数
  const extractModels = (schema) => {
    const modelRegex = /model\s+\w+\s+{[\s\S]*?}/g;
    return schema.match(modelRegex) || [];
  };
  
  // モデル名を抽出する関数
  const extractModelName = (modelDef) => {
    const match = modelDef.match(/model\s+(\w+)/);
    return match ? match[1] : null;
  };
  
  // モデルのフィールドを抽出する関数
  const extractModelFields = (modelDef) => {
    const fieldRegex = /^\s+(\w+)\s+(.+?)(?:\s+@.+)?$/gm;
    const fields = {};
    let match;
    
    while ((match = fieldRegex.exec(modelDef)) !== null) {
      fields[match[1]] = match[2].trim();
    }
    
    return fields;
  };
  
  const currentModels = extractModels(currentSchema);
  const dbModels = extractModels(dbSchema);
  
  // モデル名のマッピングを作成
  const currentModelMap = {};
  currentModels.forEach(model => {
    const name = extractModelName(model);
    if (name) currentModelMap[name] = model;
  });
  
  const dbModelMap = {};
  dbModels.forEach(model => {
    const name = extractModelName(model);
    if (name) dbModelMap[name] = model;
  });
  
  // データベースには存在するが、スキーマには存在しないモデル
  for (const modelName in dbModelMap) {
    if (!currentModelMap[modelName]) {
      validationResult.missingInSchema.push({
        name: modelName,
        definition: dbModelMap[modelName]
      });
      validationResult.isValid = false;
    }
  }
  
  // スキーマには存在するが、データベースには存在しないモデル
  for (const modelName in currentModelMap) {
    if (!dbModelMap[modelName]) {
      validationResult.missingInDb.push({
        name: modelName,
        definition: currentModelMap[modelName]
      });
      validationResult.isValid = false;
    }
  }
  
  // 両方に存在するモデルのフィールドを比較
  for (const modelName in currentModelMap) {
    if (dbModelMap[modelName]) {
      const currentFields = extractModelFields(currentModelMap[modelName]);
      const dbFields = extractModelFields(dbModelMap[modelName]);
      
      const fieldDifferences = {
        modelName,
        missingInSchema: [],
        missingInDb: [],
        typeDifferences: []
      };
      
      // データベースには存在するが、スキーマには存在しないフィールド
      for (const fieldName in dbFields) {
        if (!currentFields[fieldName]) {
          fieldDifferences.missingInSchema.push({
            name: fieldName,
            type: dbFields[fieldName]
          });
          validationResult.isValid = false;
        }
      }
      
      // スキーマには存在するが、データベースには存在しないフィールド
      for (const fieldName in currentFields) {
        if (!dbFields[fieldName]) {
          fieldDifferences.missingInDb.push({
            name: fieldName,
            type: currentFields[fieldName]
          });
          validationResult.isValid = false;
        }
        // 型の不一致をチェック
        else if (dbFields[fieldName] !== currentFields[fieldName]) {
          fieldDifferences.typeDifferences.push({
            name: fieldName,
            schemaType: currentFields[fieldName],
            dbType: dbFields[fieldName]
          });
          validationResult.isValid = false;
        }
      }
      
      if (fieldDifferences.missingInSchema.length > 0 || 
          fieldDifferences.missingInDb.length > 0 || 
          fieldDifferences.typeDifferences.length > 0) {
        validationResult.fieldDifferences.push(fieldDifferences);
      }
    }
  }
  
  // 結果の出力
  if (!validationResult.isValid) {
    console.error('スキーマドリフトが検出されました:');
    
    if (validationResult.missingInSchema.length > 0) {
      console.error('\nデータベースには存在するが、schema.prismaに存在しないモデル:');
      validationResult.missingInSchema.forEach(model => {
        console.error(`\n- ${model.name}`);
      });
    }
    
    if (validationResult.missingInDb.length > 0) {
      console.error('\nschema.prismaには存在するが、データベースに存在しないモデル:');
      validationResult.missingInDb.forEach(model => {
        console.error(`\n- ${model.name}`);
      });
    }
    
    if (validationResult.fieldDifferences.length > 0) {
      console.error('\nフィールドの不一致:');
      validationResult.fieldDifferences.forEach(diff => {
        console.error(`\nモデル: ${diff.modelName}`);
        
        if (diff.missingInSchema.length > 0) {
          console.error('  データベースには存在するが、スキーマには存在しないフィールド:');
          diff.missingInSchema.forEach(field => {
            console.error(`  - ${field.name}: ${field.type}`);
          });
        }
        
        if (diff.missingInDb.length > 0) {
          console.error('  スキーマには存在するが、データベースには存在しないフィールド:');
          diff.missingInDb.forEach(field => {
            console.error(`  - ${field.name}: ${field.type}`);
          });
        }
        
        if (diff.typeDifferences.length > 0) {
          console.error('  型の不一致:');
          diff.typeDifferences.forEach(field => {
            console.error(`  - ${field.name}: スキーマ(${field.schemaType}) vs データベース(${field.dbType})`);
          });
        }
      });
    }
    
    // 詳細なレポートをJSONファイルに出力
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const reportPath = path.join(logsDir, 'schema-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(validationResult, null, 2));
    console.error(`\n詳細なレポートが ${reportPath} に保存されました。`);
    
    process.exit(1);
  } else {
    console.log('スキーマは同期しています。不一致は検出されませんでした。');
  }
} catch (error) {
  console.error('検証中にエラーが発生しました:', error);
  process.exit(1);
} finally {
  // 一時ファイルの削除
  if (fs.existsSync(tempSchemaPath)) {
    try {
      fs.unlinkSync(tempSchemaPath);
    } catch (e) {
      console.error('一時ファイルの削除に失敗しました:', e);
    }
  }
}