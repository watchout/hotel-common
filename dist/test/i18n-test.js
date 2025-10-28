"use strict";
/**
 * i18n機能テスト
 *
 * このファイルは多言語化システムのテストを行います。
 * 特に以下の点を検証します：
 * 1. 翻訳ファイルの読み込み
 * 2. 翻訳関数の動作
 * 3. 言語切り替え
 * 4. パラメータ補間
 * 5. フォールバック機能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
exports.testActualI18n = testActualI18n;
exports.testFileSystemAccess = testFileSystemAccess;
exports.testManualTranslation = testManualTranslation;
const factory_1 = require("../i18n/factory");
/**
 * 実際のi18nシステムのテスト
 */
async function testActualI18n() {
    console.log('🧪 実際のi18nシステムをテスト中...');
    try {
        const i18n = (0, factory_1.createI18nInstance)();
        // 日本語（デフォルト）
        console.log('🇯🇵 日本語テスト:');
        console.log(`- ログインボタン: ${i18n.t('ui.buttons.login')}`);
        console.log(`- 予約確認メッセージ: ${i18n.t('messages.success.reservation_confirmed')}`);
        // 英語に切り替え
        await i18n.setLanguage('en');
        console.log('\n🇺🇸 英語テスト:');
        console.log(`- ログインボタン: ${i18n.t('ui.buttons.login')}`);
        console.log(`- 予約確認メッセージ: ${i18n.t('messages.success.reservation_confirmed')}`);
        // 中国語（簡体字）に切り替え
        await i18n.setLanguage('zh-CN');
        console.log('\n🇨🇳 中国語（簡体字）テスト:');
        console.log(`- ログインボタン: ${i18n.t('ui.buttons.login')}`);
        console.log(`- 予約確認メッセージ: ${i18n.t('messages.success.reservation_confirmed')}`);
        console.log('\n✅ i18nシステムテスト完了');
    }
    catch (error) {
        console.error('❌ i18nシステムテストエラー:', error);
    }
}
// 手動テスト用関数
function testManualTranslation() {
    const i18n = (0, factory_1.createI18nInstance)();
    // テスト用のキーと値
    const testKeys = [
        'ui.buttons.login',
        'ui.buttons.checkout',
        'messages.success.reservation_confirmed',
        'messages.error.network_error',
        'content.descriptions.hotel_welcome'
    ];
    console.log('🔍 翻訳キーのテスト:');
    testKeys.forEach(key => {
        console.log(`- ${key}: ${i18n.t(key)}`);
    });
    // パラメータ補間テスト
    console.log('\n🔄 パラメータ補間テスト:');
    const nameParam = { name: '山田' };
    console.log(`- messages.welcome: ${i18n.t('messages.welcome', nameParam)}`);
    // 存在しないキーのテスト
    console.log('\n⚠️ 存在しないキーのテスト:');
    const nonExistentKey = 'this.key.does.not.exist';
    console.log(`- ${nonExistentKey}: ${i18n.t(nonExistentKey)}`);
}
// ファイルシステムアクセステスト
async function testFileSystemAccess() {
    console.log('📂 翻訳ファイルアクセステスト:');
    try {
        // 直接ファイルを読み込んでみる
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs').promises;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('path');
        const jaPath = path.join(__dirname, '../../i18n/locales/ja.json');
        const enPath = path.join(__dirname, '../../i18n/locales/en.json');
        console.log(`- 日本語ファイル (${jaPath}):`);
        const jaContent = await fs.readFile(jaPath, 'utf8');
        const jaData = JSON.parse(jaContent);
        console.log(`  - キー数: ${Object.keys(jaData).length}`);
        console.log(`  - ボタン数: ${Object.keys(jaData.ui.buttons).length}`);
        console.log(`- 英語ファイル (${enPath}):`);
        try {
            const enContent = await fs.readFile(enPath, 'utf8');
            const enData = JSON.parse(enContent);
            console.log(`  - キー数: ${Object.keys(enData).length}`);
            console.log(`  - ボタン数: ${Object.keys(enData.ui?.buttons || {}).length}`);
        }
        catch (err) {
            const error = err;
            console.log(`  - 読み込みエラー: ${error.message}`);
        }
        console.log('\n✅ ファイルシステムアクセステスト完了');
    }
    catch (err) {
        const error = err;
        console.error('❌ ファイルシステムアクセスエラー:', error);
    }
}
// 実行関数
async function runTests() {
    console.log('🚀 i18nシステムテスト開始\n');
    // ファイルシステムアクセステスト
    await testFileSystemAccess();
    console.log('\n-----------------------------------\n');
    // 実際のi18nシステムテスト
    await testActualI18n();
    console.log('\n-----------------------------------\n');
    // 手動翻訳テスト
    testManualTranslation();
    console.log('\n🏁 すべてのテスト完了');
}
// コマンドラインから直接実行された場合
if (require.main === module) {
    runTests().catch(err => {
        const error = err;
        console.error('テスト実行エラー:', error);
    });
}
