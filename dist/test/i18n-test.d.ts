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
/**
 * 実際のi18nシステムのテスト
 */
declare function testActualI18n(): Promise<void>;
declare function testManualTranslation(): void;
declare function testFileSystemAccess(): Promise<void>;
declare function runTests(): Promise<void>;
export { testActualI18n, testManualTranslation, testFileSystemAccess, runTests };
