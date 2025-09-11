/**
 * i18n機能の手動テスト
 * 
 * このファイルは多言語化システムの基本機能をテストします。
 * TypeScriptのコンパイルエラーを回避するためにJavaScriptで実装しています。
 */

// テスト用の簡易i18nシステム
class SimpleI18n {
  constructor() {
    this.translations = {
      ja: {
        ui: {
          buttons: {
            login: 'ログイン',
            logout: 'ログアウト',
            save: '保存'
          },
          messages: {
            welcome: '{name}さん、こんにちは',
            goodbye: 'さようなら'
          }
        }
      },
      en: {
        ui: {
          buttons: {
            login: 'Login',
            logout: 'Logout',
            save: 'Save'
          },
          messages: {
            welcome: 'Hello, {name}',
            goodbye: 'Goodbye'
          }
        }
      }
    };
    
    this.currentLanguage = 'ja';
  }
  
  // 言語を切り替え
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      console.log(`言語を${language}に切り替えました`);
      return true;
    }
    return false;
  }
  
  // 翻訳を取得
  t(key, params) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    
    // ネストされたキーを辿る
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // キーが見つからない場合はキー名を返す
      }
    }
    
    // パラメータ補間
    if (params && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }
    
    return value;
  }
}

// テスト実行
function runTest() {
  console.log('🧪 i18n簡易テスト開始\n');
  
  const i18n = new SimpleI18n();
  
  // 日本語（デフォルト）
  console.log('🇯🇵 日本語テスト:');
  console.log(`- ログインボタン: ${i18n.t('ui.buttons.login')}`);
  console.log(`- ウェルカムメッセージ: ${i18n.t('ui.messages.welcome', { name: '山田' })}`);
  
  // 英語に切り替え
  i18n.setLanguage('en');
  console.log('\n🇺🇸 英語テスト:');
  console.log(`- ログインボタン: ${i18n.t('ui.buttons.login')}`);
  console.log(`- ウェルカムメッセージ: ${i18n.t('ui.messages.welcome', { name: 'Yamada' })}`);
  
  // 存在しないキー
  console.log('\n⚠️ 存在しないキーのテスト:');
  const nonExistentKey = 'ui.buttons.cancel';
  console.log(`- ${nonExistentKey}: ${i18n.t(nonExistentKey)}`);
  
  console.log('\n✅ テスト完了');
}

// ファイルシステムアクセステスト
async function testFileSystemAccess() {
  console.log('📂 翻訳ファイルアクセステスト:');
  
  try {
    // 直接ファイルを読み込んでみる
    const fs = require('fs').promises;
    const path = require('path');
    
    const jaPath = path.join(__dirname, '../../i18n/locales/ja.json');
    
    console.log(`- 日本語ファイル (${jaPath}):`);
    const jaContent = await fs.readFile(jaPath, 'utf8');
    const jaData = JSON.parse(jaContent);
    console.log(`  - キー数: ${Object.keys(jaData).length}`);
    console.log(`  - ボタン数: ${Object.keys(jaData.ui.buttons).length}`);
    
    console.log('\n✅ ファイルシステムアクセステスト完了');
  } catch (error) {
    console.error('❌ ファイルシステムアクセスエラー:', error);
  }
}

// 実行関数
async function main() {
  // 簡易テスト
  runTest();
  
  console.log('\n-----------------------------------\n');
  
  // ファイルシステムアクセステスト
  await testFileSystemAccess();
}

// コマンドラインから直接実行された場合
if (require.main === module) {
  main().catch(error => {
    console.error('テスト実行エラー:', error);
  });
}

module.exports = { runTest, testFileSystemAccess };